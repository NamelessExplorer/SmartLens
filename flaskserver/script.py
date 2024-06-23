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
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
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
from concurrent.futures import ThreadPoolExecutor, as_completed


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

def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--headless")
    driver = webdriver.Remote(
        command_executor="http://127.0.0.1:4444/wd/hub", options=options
    )
    return driver


driver1 = get_driver()
print("Driver 1 is running")
# The below code will get executed
driver2 = get_driver()
print("Driver 2 is running")

driver1.quit()
print("Driver 1 is closed")
driver2.quit()
print("driver 2 is closed")



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
  capabilities = {
        "browserName": "chrome",
        "browserVersion": "latest",
        "platformName": "ANY",
        "goog:chromeOptions": {"args": ["--headless"]}
    }
  driver = webdriver.Remote(
        command_executor='http://localhost:4444/wd/hub',
        desired_capabilities=capabilities,
        options=options
    )  # Replace with your preferred browser's WebDriver
  return driver


# Create an empty list to store link URLs
link_urls = []

def get_google_search_links(search_query):
    
    driver = web_driver()
    driver.get("https://www.google.com/")

        
    options = webdriver.ChromeOptions()
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--verbose")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920, 1220")
    options.add_argument("--disable-dev-shm-usage")
    options.add_experimental_option("prefs", {"profile.managed_default_content_settings.images": 2})
    
    search_box = driver.find_element(By.NAME, "q")
    search_box.send_keys(search_query)
    search_box.send_keys(Keys.ENTER)
    
    time.sleep(2)
    
    link_urls = []
    while len(link_urls) < 10:
        search_results = driver.find_elements(By.CSS_SELECTOR, ".tF2Cxc")
        for result in search_results:
            link_element = result.find_element(By.TAG_NAME, "a")
            link_url = link_element.get_attribute("href")
            if link_url:
                link_urls.append(link_url)
            if len(link_urls) == 10:
                break
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        if not driver.find_elements(By.CSS_SELECTOR, ".tF2Cxc"):
            break
    
    driver.quit()
    return link_urls



hub_url = "http://your-selenium-grid-hub:4444/wd/hub"

# Desired capabilities (browser you want to use, e.g., Chrome)
desired_capabilities = DesiredCapabilities.CHROME

# Extract and display text from each link

def scrape_link(link_url):
    driver = webdriver.Remote(
        command_executor=hub_url,
        desired_capabilities=desired_capabilities
    )
    all_text = ""
    
    try:
        driver.get(link_url)
        time.sleep(1)  # Adjust the wait time if necessary

        # Extract text using newspaper3k
        article = Article(link_url)
        article.download()
        article.parse()

        # Append the extracted text to the overall text
        all_text += article.text + "\n"
        
        print(f"Scraped text from {link_url}")

    except TimeoutException:
        print(f"Timeout exception for {link_url}. Moving to the next link.")
    except ArticleException as e:
        print(f"Error extracting text from {link_url}: {e}")
    finally:
        driver.quit()
    
    return all_text


with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(scrape_link, link_urls))

final_text = "".join(results)
# Save all extracted text to a single text file
output_file_path = "extracted_text.txt"
with open(output_file_path, "w", encoding="utf-8") as file:
    file.write(final_text)

# Close the browser

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