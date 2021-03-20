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
!["Web scraping" Google Trends](/assets/images/webscraping_google_trends_2021.png)

Can you do an estimation of how many Medium articles talk about _scraping_?   

Google says there are around 65K introductory articles about web scraping. Similar search with the "advanced" term yields <10K articles. I have randomly read 5 of the latter and, to be honest, they don't seem to cover advanced and important topics such as fingerprinting, authentication, session handling, captchas, META leveraging, fingerprinting, evasion techniques, proxies, retry strategies, framework architectures, scaling headful/headless browsers, etc

```bash
curl "https://www.google.com/search?q=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29&client=firefox-b-d&oq=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29" -A "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0" | grep -Eo 'Aproximadamente (.*?) resultados'
>>> Aproximadamente 66.400 resultados
```

As you can suspect, the topic I will cover here is not introductory. To make the best out of this read, you should have some basic background on basic computer science, networks and web scraping. There's a bit of secrecy in the obscure world of scraping once you want to pass certain challenges; and I want to uncover and demystify even if it's a tiny piece of this world. That's the reason I'm going to skip some basics.
 
**_What can you expect from this post?_** In short, I want to show you a way to scrape clean and already structured data from a website without having to deal with dirty HTMLs. The process will teach you how to reverse engineer the API service endpoints from a large website by intercepting the backend <-> frontend communications using the mobile app version of the service. And then, we will see how to exploit this API to extract the data with total freedom. In a different post I will show you how to build a dashboard to present this data and reveal insights out of it.  

_Note_ 📝: this is not an universal process that will work every time, but it may give you yet-another-technique and a head start in cases where your target website has a mobile app.

## API >> Web page
As a rule of thumb. It's great if we can extract data through a target's site API instead of having to parse HTML files for various reasons:
1. Reliability. API definitions tend to vary way less often than rendered web pages over time
2. Robustness. HTML scraping depend on parsing rules that are fragile because they depend on "soft definition" such as CSS attributes, element IDs, elements order, URL linking strategies, metadata, SPA labels, etc.
3. Accessibility. Hosted sites are protected way more heavily than APIs. The latter might have throttling, but it surely won't have WAF, perimetrals, CAPTCHA or honeypots
4. Speed. APIs don't need rendering, static files nor additional blocking server calls like AJAX. It's a 1:1 communication with the data source

> ✏️ Remember: in scraping, API >> HTML web page (always look first for possible APIs that serve the data you need)

For this tutorial, I'm going to be scraping [AutoScout24](https://www.autoscout24.com/), which is the largest used car marketplace in Europe, with 1.2MM active listings announced at the moment of writing this post. Due to the aforementioned reasons, we want to scrape the site using some API if possible. Please, always [respect](https://towardsdatascience.com/ethics-in-web-scraping-b96b18136f01) the target servers.  


## Set up

**_What tools do I need?_** This tutorial explains the process with the tools I have used: an iPhone 12, a Macbook Pro with Big Sur, Postman, Mitmproxy (MITM) and access to a router with port forwarding enabled. Nevertheless, you can replace any of them with similar tooling, the process should be similar.

1. Install the AutoScout24 app on your mobile device
1. Install MITM proxy on your computer using [this] tutorial
1. Take note of your computer's local IP address
1. Activate the proxy on your mobile device to send all outgoing traffic to your computer:
- On iOS:
- On Android:
1. Install the security certificate on your mobile device as explained [here](https://docs.mitmproxy.org/stable/concepts-certificates/)
1. Run `mitmproxy` on your computer's shell
1. Open the AutoScout24 app on your mobile device. You should now start to see the traffic flow


## Finding the API
Placeholder for Snooping around results, documentation, toy swagger, Postman, app captures, searches, etc

Talk about the ios-user and tokens

## GraphQL introspection
Placeholder for GraphQL introspection queries. Basic, models, objetcs, and complex brute force

## Building a spider
Placeholder for Scrapy stuff, settings, query assets, etc

## Summary
- Invest some time looking for API data sources. Scrape HTMLs after giving up
- MITM Proxy is a powerful tool and useful in any mobile-involved scenario
- Learning backend and network concepts is a must for advanced web scraping
- Scrapy is my favorite scraping framework. Thanks so much to their [creators and contributors](https://github.com/scrapy/scrapy/graphs/contributors)
- You can find the source code for this project in my GitHub -> 