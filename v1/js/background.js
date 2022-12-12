const logSubject = async details => {
  try {
    let securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, {
      certificateChain: true,
      rawDER: true
    });

    // console.log("check if this DNS record is issued by TRR (Trusted Recursive Resolver)");
    if(typeof details.originUrl !== 'undefined') {
      let host = (new URL(details.originUrl)).hostname;
      console.log(host);
      let res = await browser.dns.resolve(host);
      console.log(res);
    }

    //Updates the data
    let data = (await browser.storage.local.get("data")).data;
    updateData(data, details, securityInfo);
    browser.storage.local.set({data}).then(console.log("SecurityInfo Logged Successfully"), error => {console.error(error);});
  }
  catch (error) {
    console.error(error);
  }
};

const logOnBeforeNavigate = async details => {
  try {
    if (details.frameId !== 0) {
      return;
    }  

    let hostname = extractHostname(details.url);
    if(hostname.includes("undefined")) {
      //this happens when details.url = "about:blank" etc
      return;
    }

    let data = (await browser.storage.local.get("data")).data;
    let newRow = [details.tabId, hostname, 0, details.timeStamp, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let index = findLast(details.tabId, data);
    if (index === -1) {
      data.push(newRow);
    } else {
      let lastRow = data[index];
      //indices: 0 = tabId, 1 = hostname, 2 = count, 3 = timeStamp
      if (lastRow[0] === newRow[0] && lastRow[1] === newRow[1] && lastRow[2] === 0) {
        console.error("probably listener double fire");
      } else if (lastRow[0] === newRow[0] && lastRow[1] === newRow[1] && newRow[3] - lastRow[3] < 1500) {
        console.error("probably listener double fire");
      } else {
        data.push(newRow);
      }
    }

    browser.storage.local.set({data}).then(console.log("WebNav set data successfully"), error => {console.error(error);});
  }
  catch (error) {
    console.log(error);
  }
};

function updateData(data, details, securityInfo) {
  let hostname;
    if (typeof details.documentUrl == 'undefined') {
      // console.log("docUrl undefined");
      hostname = extractHostname(details.url);
    } else {
      hostname = extractHostname(details.documentUrl);
    }
    
    //Find the page in array associated with this request
    let tabNumber = details.tabId;
    let index = findLast(tabNumber, data);

    if(index === -1) {
      index = findLastDoc(hostname, data);
      if(index === -1) {
        // console.error("Indexing problem in webRequest listener callback");
        return;
      }
    }

    // index 2 = webRequest count
    data[index][2] = data[index][2] + 1;
    
    let secState = securityInfo.state;
    //indices: 4 = secure; 5 = insecure; 6 = broken; 7 = weak;
    if (secState === "secure") {
      data[index][4] = data[index][4] + 1;
    } else if (secState === "insecure") {
      data[index][5] = data[index][5] + 1;
    } else if (secState === "broken") {
      data[index][6] = data[index][6] + 1;
    } else if (secState === "weak") {
      data[index][7] = data[index][7] + 1;
    }
    //"hpkpTrue",8 "hpkpFalse",9 "hstsTrue",10"hstsFalse"11
    if (typeof securityInfo.hpkp !== 'undefined') {
      if(securityInfo.hpkp === true) {
        data[index][8] = data[index][8] + 1;
      } else {
        data[index][9] = data[index][9] + 1;
      }
    }
    if (typeof securityInfo.hsts !== 'undefined') {
      if(securityInfo.hsts === true) {
        data[index][10] = data[index][10] + 1;
      } else {
        data[index][11] = data[index][11] + 1;
      }
    }
    if (typeof securityInfo.isExtendedValidation !== 'undefined') {
      if(securityInfo.isExtendedValidation === true) {
        data[index][12] = data[index][12] + 1;
      } else {
        data[index][13] = data[index][13] + 1;
      }
    }
}

function extractHostname(url) {
  if (typeof url == 'undefined') {
    return "undefined";
  }
  let myUrl = new URL(url);
  let hostname = myUrl.hostname;

  let i = hostname.indexOf("www");
  if (i !== -1) {
    let temp = hostname.slice(i + 1, hostname.length);
    let j = temp.indexOf(".");
    return temp.slice(j + 1, temp.length);
  }
  return hostname;
}

function findLastDoc(str, array) {
  let i = array.length - 1;
  while(i > 0) {
    if(array[i][1] === str) {
      return i;
    }
    i--;
  }
  return -1;
}

function findLast(id, array) {
  if (id === -1) {
    return -1;
  }
  let i = array.length - 1;
  while(i >= 0) {
    if(array[i][0] === id) {
      return i;
    }
    i--;
  }
  return -1;
}

browser.storage.local.get().then(results => {
  // Initialize the saved stats if not yet initialized.
  if (typeof results.data == 'undefined') {
    data = [];
    data.push(["tabId", 
              "hostname", 
              "countRequests", 
              "timeStamp", 
              "countSecure", 
              "countInsecure", 
              "countBroken", 
              "countWeak",
              "countHpkpTrue",
              "countHpkpFalse",
              "countHstsTrue",
              "countHstsFalse",
              "countIsExtendedValidationTrue",
              "countIsExtendedValidationFalse"]);
    browser.storage.local.set({data}).then(console.log("Data initialized"), error => {console.error(error);});
  }


});

browser.webNavigation.onBeforeNavigate.addListener(logOnBeforeNavigate);

browser.webRequest.onHeadersReceived.addListener(logSubject,
  {urls: ["<all_urls>"]},
  ["blocking"]
);
