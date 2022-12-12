from selenium import webdriver
import pandas as pd
import time

sites = pd.read_csv("./top500Domains.csv")
sites["Root Domain"] = sites["Root Domain"].astype("string")
websites = sites["Root Domain"].apply(lambda x: "http://" + x)

driver = webdriver.Firefox()
driver.install_addon(path='./v1', temporary=True)

for link in websites[0:40]:
    try:
        driver.get(link)
        time.sleep(3)
    except:
        print("An exception occurred")

print("done")
    
