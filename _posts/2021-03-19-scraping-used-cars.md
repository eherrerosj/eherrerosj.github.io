---
title: 'Scraping data from 1 million used-cars without the HTML hassle'
toc: true
categories:
  - scraping
tags:
  - scraping
  - scrapy
  - graphql
  - python
  - ecommerce
---

Interest for web scraping **has doubled** in the last 4 years:
!["Web scraping" Google Trends](/assets/images/post-scraping-graphql/webscraping_google_trends_2021.png)

Can you estimate how many Medium articles talk about _scraping_?   

Google says there are around 65K introductory articles about web scraping. Similar search with the "advanced" term yields <10K articles. I have randomly read 5 of the latter and, to be honest, they don't cover advanced and important topics such as fingerprinting, authentication, session handling, captchas, META leveraging, fingerprinting, evasion techniques, proxies, retry strategies, framework architectures, scaling headful/headless browsers, etc.

```bash
curl "https://www.google.com/search?q=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29&client=firefox-b-d&oq=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29" -A "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0" | grep -Eo 'Aproximadamente (.*?) resultados'
>>> Aproximadamente 66.400 resultados
```

What does this tell us? Well, there's a bit of secrecy in the obscure world of scraping once you want to confront certain challenges; and I would like to uncover and demystify even if it's a tiny piece of such world. Thus, the topic I will cover here is not introductory. To make the best out of this read, you should have some basic background on web scraping and computer science. 
 
**_What can you expect from this post?_** In short, I want to show you a way to scrape clean and already structured data from a website without having to deal with unstructured HTMLs. The process will teach you how to reverse engineer the API service endpoints from a large website by intercepting its backend ⟷ frontend communications using the mobile app version of the service. I will leave to a different post how to run analytics and create a dashboard out of the data we obtained after this post.

_Note_ 📝: this is not an universal process that will work every time, but it may give you yet-another-technique and a head start in cases where your target website has a mobile app.

## API >> Web page
As a rule of thumb. It's great if we can extract data through a target's site API instead of having to parse HTML files for various reasons:
1. Reliability. API definitions tend to vary way less often than rendered web pages over time
2. Robustness. HTML scraping depend on parsing rules that are fragile because they depend on "soft definition" such as CSS attributes, element IDs, elements order, URL linking strategies, metadata, SPA labels, etc.
3. Accessibility. Hosted sites are protected way more heavily than APIs. The latter might have throttling, but it surely won't have WAF, perimetrals, CAPTCHA or honeypots
4. Speed. APIs don't need rendering, static files nor additional blocking server calls like AJAX. It's a 1:1 communication with the data source

> ✏️ Tip: when scraping, APIs are first-class citizens. They rule over HTML web page. Always spend some time looking for APIs. Normally you would first try using a desktop browser: browsing the pages of interest while the console developer is open and on the "network" tab with the "XHR" filter activated.

For this tutorial, I'm going to be scraping [AutoScout24](https://www.autoscout24.com/), which is the largest used car marketplace in Europe, with 2MM+ active listings announced at the moment of writing this post. Due to the aforementioned reasons, we want to scrape the site using some API if possible. Please, make sure you always [respect](https://towardsdatascience.com/ethics-in-web-scraping-b96b18136f01) the target servers.

We can first try finding interesting endpoints with the XHR technique. We go to the console developer while launching a search with filters, then click on network, then XHR, then results and we can click on the different requests from the list. We see that none of them displays results in json format, which is what we would expect from a REST API:

![AS24 XHR on desktop search](/assets/images/post-scraping-graphql/as24-xhr-no-results.png "AS24 XHR on desktop search")

Let's start the show! 🎸🥁🎹

## Set up

**_What tools do I need?_** This tutorial explains the process with the tools I have used: an iPhone 12, a Macbook Pro with Big Sur, Postman, Mitmproxy (MITM) and access to a router with port forwarding enabled. Nevertheless, you can replace any of them with similar tooling, the process should be similar.

1. Install the [AutoScout24](https://apps.apple.com/es/app/autoscout24-coches-de-ocasion/id311785642) app on your iOS/Android device
1. Install [Postman](https://www.postman.com/downloads/). It's a very useful API tester that I use both for developing and for 3rd party API inspection
1. Install MITM proxy on your computer. On MacOS: `brew install mitmproxy`
1. Take note of your computer's local IP address. `ipconfig getifaddr en0`
1. Activate the proxy on your mobile device to send all outgoing traffic to your computer's local IP address on port 8080 and no authentication. On iOS: `settings > wifi > select current network > configure proxy`
1. Install the security certificate on your mobile device as explained [here](https://docs.mitmproxy.org/stable/concepts-certificates/). Basically just visit [mitm.it](mitm.it) from your mobile's browser and from there you will be able to install the `.pem` cert
1. Enable the MITM profile. On iOS: `settings > general > profile > mitmproxy > install`
![iOS mitm proxy profile install](/assets/images/post-scraping-graphql/mitmproxy-profile-setup.png "iOS mitm proxy profile install")
1. Enable the SSL certificate. On iOS: `settings > general > about > certificate trust settings > toggle mitmproxy to ON`
![iOS https certificate activation](/assets/images/post-scraping-graphql/mitmproxy-traffic-setup.png "iOS https certificate activation")
1. Run `mitmproxy` on your computer's shell
1. Open the AutoScout24 app on your mobile device. You should now start seeing the traffic flow 😍
![MITM proxy capturing all mobile's web traffic](/assets/images/post-scraping-graphql/as24-mitm-results.png "MITM proxy capturing all mobile's web traffic")

_Note_ 📝: hit `?` while on mitm proxy cli to get the shortcut help list. Or visit [this](https://www.stut-it.net/blog/2017/mitmproxy-cheatsheet.html) webpage.

## Finding the API
Placeholder for Snooping around Talk about graphql, the ios-user and tokens, results, documentation, toy swagger, Postman, app captures, searches, etc


```python
>>> import base64
>>> as24_auth = "aW9zLWFwcDpBbGJ3ajJ0VlJuWEd6NTF3MmN3MWxHVnY1bzVpMDg="
>>> as24user, as24password = base64.b64decode(as24_auth).decode('utf-8').split(":")
>>> print(as24user, as24password)
ios-app Albwj2tVRnXGz51w2cw1lGVv5o5i08
```


![AS24 hidden API docs](/assets/images/post-scraping-graphql/as24-hidden-docs.png "as24-hidden-docs")

![AS24 API limits](/assets/images/post-scraping-graphql/as24-api-limits.png "as24-api-limits")
We were lucky enough to find this info here. Otherwise we would run into issues when paging over the 400 max results limit or we wouldn't know 


![GraphQL vs REST. Source: https://github.com/ThomRoman/GraphQL](/assets/images/post-scraping-graphql/rest vs graphql.webp "GraphQL vs REST. Source: https://github.com/ThomRoman/GraphQL")


Authorization header uses Basic auth method where user and password are concatenated with ":" and converted to base64. After repeating the whole MITM process with a different mobile, I found out that the iOS credentials do not change over time nor device. Good for us.
```bash
curl --location --request POST 'https://listing-search.api.autoscout24.com/graphql' \
--header 'accept: /' \
--header 'content-type: application/json' \
--header 'authorization: Basic aW9zLWFwcDpBbGJ3ajJ0VlJuWEd6NTF3MmN3MWxHVnY1bzVpMDg=' \
--header 'user-agent: AutoScout24/12.3.4 iPhone/14.0.1' \
--header 'accept-language: es-ES;q=1.0, en-ES;q=0.9, pt-BR;q=0.8' \
--data-raw '{"query":"{\n  __schema {\n    types {\n      name\n      description\n    }\n  }\n}","variables":{}}'
```


## GraphQL introspection
Placeholder for GraphQL introspection queries. Basic, models, objetcs, and complex brute force

> Creating a key binding shortcut for curl command copying to clipboard:
>1. From MITM's flowlist view, hit `K`, then `a`, select the context `flowlist`
>1. Type `c export.clip curl @focus`. Which will use the key `c` to copy the request as curl

## Building a spider
Placeholder for Scrapy stuff, settings, query assets, etc

## Summary
- Invest some time looking for API data sources. Scrape HTMLs after giving up
- MITM Proxy is a powerful tool and useful in any mobile-involved scenario
- Learning backend and network concepts is a must for advanced web scraping
- Scrapy is my favorite scraping framework. Thanks so much to their [creators and contributors](https://github.com/scrapy/scrapy/graphs/contributors)
- You can find the source code for this project in my GitHub -> 