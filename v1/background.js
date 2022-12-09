const logSubject = async details => {
    try {
        let securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, {
            certificateChain: true,
            rawDER: true
        });
        //console.log(securityInfo);
        // console.log("check if this DNS record is issued by TRR (Trusted Recursive Resolver)");
        let host = (new URL(details.originUrl)).hostname;
        console.log(host);
        let res = await browser.dns.resolve(host);
        console.log(res);

        //Updates the data
        let data = (await browser.storage.local.get("data")).data;
        let dochost;
        if (typeof details.documentUrl == 'undefined') {
          // console.log("docUrl undefined");
          dochost = extractHostname(details.url);
        } else {
          dochost = extractHostname(details.documentUrl);
        }
        
        //Find the webnav entry in array associated with this request
        let tabNumber = details.tabId;
        let index = findLast(tabNumber, data);

        if(index === -1) {
          index = findLastDoc(dochost, data);
          if(index === -1) {
            // console.error("Indexing problem in webRequest listener callback");
            return;
          }
        } else {
          //increment num
          data[index][2] = data[index][2] + 1;
        }

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
        //console.log(data);
        browser.storage.local.set({data})/*.then(console.log("SecurityInfo Logged Successfully"), error => {console.error(error);})*/;
    }
    catch (error) {
        console.error(error);
    }
};

const logOnBeforeNavigate = async details => {
  if (details.frameId === 0) {
    console.log("=======================NAV========================");
    try {
      let host = extractHostname(details.url);
      if(host.includes("undefined")) {
        // console.log("undefined host");
        //this happens when details.url = "about.blank"
      } else {
        let data = (await browser.storage.local.get("data")).data;

        let newRow = [details.tabId, host, 0, details.timeStamp, 0, 0, 0, 0];
        //if (arraysEqual(data[data.length - 1], newRow)) {
        if (data[data.length - 1][0] === newRow[0] && data[data.length - 1][1] === newRow[1] && data[data.length - 1][2] === 0) {
          //console.error("hmm");
        } else if (data[data.length - 1][0] === newRow[0] && data[data.length - 1][1] === newRow[1] && newRow[3] - data[data.length - 1][3] < 500) {
          data[data.length - 1][3] = row[3];
          console.error("probably listener double fire");
        } else {
          data.push(newRow);
        }
        //console.log(data);
        browser.storage.local.set({data})/*.then(console.log("webnav setting success"), error => {console.error(error);})*/;
      }
    }
    catch (error) {
      console.log(error);
    }
  }
};

browser.storage.local.get().then(results => {
  // Initialize the saved stats if not yet initialized.
  if (typeof results.data == 'undefined') {
    data = [];
    data.push(["tabId", "documentUrl", "num", "timeStamp", "countSecure", "countInsecure", "countBroken", "countWeak"]);
    //4 = secure; 5 = insecure; 6 = broken; 7 = weak;
    browser.storage.local.set({data})/*.then(console.log("Data initialized Success"), error => {console.error(error);})*/;
  }


});

browser.webNavigation.onBeforeNavigate.addListener(logOnBeforeNavigate);

browser.webRequest.onHeadersReceived.addListener(logSubject,
  {urls: ["<all_urls>"]},
  ["blocking"]
);

 //from https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
  if (a == null || b == null) return false;
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

//https://stackoverflow.com/questions/6449340/how-to-get-base-domain-from-the-url-in-javascript
function extractHostname(url) {
  if (typeof url == 'undefined') {
    return "undefined";
  }
  let hostname;

  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];

  //find & remove "?"
  hostname = hostname.split('?')[0];

  let hostnames = hostname.split('.');
  hostname = hostnames[hostnames.length-2] + '.' + hostnames[hostnames.length-1];

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
