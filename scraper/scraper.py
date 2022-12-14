from selenium import webdriver
from selenium.webdriver.common.by import By
import pandas as pd
import time
import os

scraper_folder = os.path.dirname(__file__)
project_folder = os.path.dirname(scraper_folder)

sites = pd.read_csv(scraper_folder + "/top500Domains.csv")
sites["Root Domain"] = sites["Root Domain"].astype("string")
websites = sites["Root Domain"].apply(lambda x: "https://" + x)

driver = webdriver.Firefox()
addon_path = project_folder + "/v1"
driver.install_addon(path=addon_path, temporary=True)

j = 0
for link in websites[0:50]:
    failed = False
    try:
        driver.get(link)
        j += 1
        print("get #: " + str(j) + " was " + link)
        time.sleep(7)
    except Exception as e:
        failed = True
        #print(str(e))
        print("error on " + link)
    
    if not failed:
        elems_raw = driver.find_elements(By.XPATH, '//a[@href]')
        hrefs = []
        for elem in elems_raw:
            hrefs.append(elem.get_attribute("href"))

        count = 0
        for my_link in hrefs:
            try:
                driver.get(my_link)
                j += 1
                print("get #: " + str(j) + " was " + my_link)
                count += 1
                if count >= 10:
                    break
                time.sleep(7)
            except Exception as e:
                print("error on " + my_link)
                #print(str(e))

        #if there weren't enough hrefs, we can try the original link some more 
        # to try to get the same amount of data for each domain
        while count < 10:
            try:
                driver.get(link)
                j += 1
                print("get #: " + str(j) + " was " + link)
                time.sleep(7)
            except Exception as e:
                #print(str(e))
                print("error on " + link)
    print("NEXT OUTER LINK")
    
# this while loop is so that the program doesn't terminate, so that 
# so we can go in an extract the data. Can remove this
# if we add functionality to the extension to communicate with this script
while True:
    print("DONE")
    time.sleep(30)

    
