from selenium import webdriver
from selenium.webdriver.common.by import By
import pandas as pd
import time
import os

scraper_folder = os.path.dirname(__file__)
project_folder = os.path.dirname(scraper_folder)

# reads data from csv obatained from https://moz.com/top500
sites = pd.read_csv(scraper_folder + "/top500Domains.csv")
sites["Root Domain"] = sites["Root Domain"].astype("string")
websites = sites["Root Domain"].apply(lambda x: "https://" + x)

driver = webdriver.Firefox()
addon_path = project_folder + "/v1"
driver.install_addon(path=addon_path, temporary=True)

i = 0
j = 0
for link in websites[0:100]:
    i += 1
    print("outer link: " + str(i))
    try:
        driver.get(link)
        j += 1
        print("get #" + str(j) + " was " + link)

        time.sleep(7)

        elems = driver.find_elements(By.XPATH, '//a[@href]')
        hrefs = []
        for elem in elems:
            hrefs.append(elem.get_attribute("href"))

        for my_link in hrefs[0:9]:
            driver.get(my_link)
            j += 1
            print("get #" + str(j) + " was " + link)

            time.sleep(7)
    except Exception as e:
        #print(str(e))
        print("error on " + link)
    
# this while loop is so that the program doesn't terminate, so that 
# so we can go in an extract the data. Can remove this
# if we add functionality to the extension to communicate with this script
while True:
    print("DONE")
    time.sleep(30)

    
