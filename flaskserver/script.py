from langchain_community.chat_models import ChatKonko
from langchain.agents import AgentType, Tool, initialize_agent
from langchain_community.document_loaders import WebBaseLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.document_transformers import BeautifulSoupTransformer
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain.embeddings.huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
from newspaper import Article, ArticleException
import time
import os
import sys
import json
import easyocr
from langchain import HuggingFaceHub
from langchain.chains import RetrievalQAWithSourcesChain, ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain import PromptTemplate
from PIL import Image
from pinecone import Pinecone, ServerlessSpec
from langchain.vectorstores import pinecone
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv



load_dotenv()

image = Image.open("uploads/image.png")
print("Image loaded successfully!")
name = ""

reader = easyocr.Reader(['en']) # specify the language  
# result = reader.readtext('https://res.fkhealthplus.com/incom/images/product/Kuffdryl-1689569422-10068298-1.jpg')
result = reader.readtext(image)
search = "drugs.com information on "
i = 0

for (bbox, text, prob) in result:
    (top_left, top_right, bottom_right, bottom_left) = bbox
    # print(f'Text: {text}, Probability: {prob}')
    if i==0:
        name += text
        i+=1
    if(prob>0.6):
      search+=text

# print(text)



def web_driver():
  options = webdriver.ChromeOptions()
  options = Options()
  options.add_argument("--headless")
  options.add_argument("--verbose")
  options.add_argument("--no-sandbox")
  options.add_argument("--disable-gpu")
  options.add_argument("--window-size=1920, 1220")
  options.add_argument("--disable-dev-shm-usage")
  options.add_experimental_option("prefs", {"profile.managed_default_content_settings.images": 2})
  driver = webdriver.Chrome(options=options)  # Replace with your preferred browser's WebDriver
  return driver

driver = web_driver()


# Construct the search query
# print(search)
search_query = f"{search}"

# Navigate to Google Search
driver.get("https://www.google.com/")

# Find the search box and enter the query
search_box = driver.find_element(By.NAME, "q")
search_box.send_keys(search_query)
search_box.send_keys(Keys.ENTER)

# Wait for the search results to load (you may need to adjust the wait time)
time.sleep(2)

# Create an empty list to store link URLs
link_urls = []

# Scroll down to load more results dynamically
while len(link_urls) < 10:
    search_results = driver.find_elements(By.CSS_SELECTOR, ".tF2Cxc")

    # Loop through search results and extract URL from each link
    for result in search_results:
        link_element = result.find_element(By.TAG_NAME, "a")
        link_url = link_element.get_attribute("href")
        link_urls.append(link_url)

        if len(link_urls) == 10:
            break

    # Scroll down to load more results
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)  # Adjust the wait time if necessary

    # Check if there are no more results to load
    if not driver.find_elements(By.CSS_SELECTOR, ".tF2Cxc"):
        break

# Extract and display text from each link
all_text = ""
for i, link_url in enumerate(link_urls, start=1):
    # print(f"{i}. {link_url}")

    # Navigate to the link
    try:
        driver.get(link_url)
        time.sleep(1)  # Adjust the wait time if necessary

        # Extract text using newspaper3k
        article = Article(link_url)
        article.download()
        article.parse()

        # Append the extracted text to the overall text
        all_text += article.text + "\n"
    except TimeoutException:
        # print(f"Timeout exception for {link_url}. Moving to the next link.")
        continue
    except ArticleException as e:
        # print(f"Error extracting text from {link_url}: {e}")
        continue  # Move to the next link on error

# Save all extracted text to a single text file
output_file_path = "extracted_text.txt"
with open(output_file_path, "w", encoding="utf-8") as file:
    file.write(all_text)

# Close the browser
driver.quit()

time.sleep(2)


#Vectorizing the data

loader = TextLoader("extracted_text.txt")
data = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200, separators=["\n\n", "\n", "(?<=\. )", " "], length_function=len)
docs = text_splitter.split_documents(data)

# Insert the documents in FAISS with their embedding
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2", cache_folder="/embedding_model")
# docsearch = FAISS.from_documents(
#     docs, embeddings
# )


#LLM Model answering questions

os.getenv("PINECONE_API_KEY")

pinecone.init(
            api_key= os.environ['PINECONE_API_KEY'], # set api_key = 'yourapikey'
            environment= 'us-east-1'
)

index_name = "langchain-test-index"

vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
vectorstore.add_documents(docs)

vectordb = Pinecone.from_documents(docs, embeddings, index_name='index-1')
retriever = vectordb.as_retriever()


memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


query="Provide all the details about the medicine {med} in a list, like name, age range, precautions, use case(When and how to use), dosage."


q1 = "Give the name of the medicine {med}."

q2 = "Give the age range of users who can use this medicine {med}. Phrase it like: '30-40' or 'Under 2 not allowed'."

q3 = "Give a short and concise list of precautions one must take when using this medicine {med}."

q4 = "Give the method of using this medicine {med} appropriately."

q5 = "Give the risks of using this medicine {med}."


os.getenv("KONKO_API_KEY")

chain = ConversationalRetrievalChain.from_llm(
      ChatKonko(max_tokens=1000, model="meta-llama/llama-2-70b-chat", temperature=0.5),
      chain_type="map_reduce",
      retriever=retriever.as_retriever(),
      memory = memory
)

results = chain.run(query)

res1 = chain.run(q1)
res2 = chain.run(q2)
res3 = chain.run(q3)
res4 = chain.run(q4)
res5 = chain.run(q5)

# print(results)

data = {
    "message": "Image data extracted!",
    "name":res1,
    "age":res2,
    "precautions":res3,
    "usecase":res4,
    "risks":res5
}

json_string = json.dumps(data)
print(json_string)


# demotemplate = '''Here is the input {row}. You are a Medical Assistant. Your role is to provide factual details about the medicine from the given data.'''

# prompt = PromptTemplate(
#             input_variables = ['row'],
#             template = demotemplate
#         )


# summarizer = HuggingFaceHub(
#           repo_id="facebook/bart-large-cnn",
#           model_kwargs={"temperature":0, "max_length":2000}
#         )


# chain1 = LLMChain(llm=summarizer, prompt=prompt)

# chain1.run()

           
