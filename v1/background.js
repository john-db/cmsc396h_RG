async function logSubject(details) {
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
    }
    catch (error) {
        console.error(error);
    }
}

browser.webRequest.onHeadersReceived.addListener(logSubject,
    {urls: ["<all_urls>"]},
    ["blocking"]
);