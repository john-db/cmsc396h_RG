from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
import pandas as pd
import time
import os

scraper_folder = os.path.dirname(__file__)
project_folder = os.path.dirname(scraper_folder)

# reads data from csv obatained from https://moz.com/top500
# sites = pd.read_csv(scraper_folder + "/top500Domains.csv")
# sites["Root Domain"] = sites["Root Domain"].astype("string")
# websites = sites["Root Domain"].apply(lambda x: "https://" + x)

# reads data from csv obatained from https://majestic.com/reports/majestic-million, the csv file is the first 1000 rows b/c the full file was too large
sites = pd.read_csv(scraper_folder + "/majestic_thousand.csv")
sites["Domain"] = sites["Domain"].astype("string")
websites = sites["Domain"].apply(lambda x: "https://" + x)


#block popups
options=Options()
options.set_preference("dom.popup_maximum", 0)


driver = webdriver.Firefox(options=options)
#install the addon
addon_path = project_folder + "/v1"
driver.install_addon(path=addon_path, temporary=True)

driver.set_page_load_timeout(10)

k = 0
while True:
    k += 1
    print("Beginning of trial: " + str(k))
    i = 0
    j = 0
    for link in websites[0:200]:
        i += 1
        print("\touter link: " + str(i))
        try:
            driver.get(link)
            j += 1
            print("\t\tget #" + str(j) + " was " + link)

            time.sleep(1)
        except Exception as e:
            #print(str(e))
            print("\t\terror on " + link)
    print("End of trial: " + str(k))
    
# this while loop is so that the program doesn't terminate, so that 
# so we can go in an extract the data. Can remove this
# if we add functionality to the extension to communicate with this script
while True:
    print("DONE")
    time.sleep(30)

    
