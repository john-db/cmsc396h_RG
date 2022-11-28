async function logSubject(details, results) {
    try {
        let securityInfo = await browser.webRequest.getSecurityInfo(details.requestId, {
            certificateChain: true
        });
        console.log("---------------------")
        console.log(details.url);
        console.log(securityInfo)

        console.log("check if this DNS record is issued by TRR (Trusted Recursive Resolver)")
        let host = (new URL(details.originUrl)).hostname

        let res = await browser.dns.resolve(host)
        console.log(res)
        console.log("---------------------")
        console.log(" ")
        console.log(" ")
        console.log(" ")
        console.log(" ")
        console.log(" ")

        //Updates the data
        results.data.push([host,
                           details.tabId,
                           securityInfo.isExtendedValidation
                          ]);
        browser.storage.local.set(results).then(console.log("Successfully updated data"));

    }
    catch (error) {
        console.error(error);
    }
}

browser.storage.local.get().then(results => {
  // Initialize the saved stats if not yet initialized.
  if (!results.stats) {
    results = {
      data: new Array()
    };
    results.data.push(["hostname",
                      "tabId",
                      "isExtendedValidation"
                    ]);
  }

  browser.webRequest.onHeadersReceived.addListener(details => logSubject(details, results),
      {urls: ["<all_urls>"]},
      ["blocking"]
    );
});
