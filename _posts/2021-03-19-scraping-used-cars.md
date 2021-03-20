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


There are gazillions of introductory tutorials and posts about scraping. This is not one of them. You are hereby advised that you will need some fundamental concepts about web scraping and computer science to make the best out of this read. There's a bit of secrecy in the obscure world of scraping once you want to pass certain challenges; and I want to uncover and demistify even if it's a tiny piece of this world.
 
**_What can you expect from this post?_** In short, I want to show you a way to scrape clean and already structured data from a website without having to deal with dirty HTMLs. The process will teach you how to reverse engineer the API service from a large website by intercepting the backend <-> frontend communications using the mobile app version of the service. And then, we will see how to exploit this API to extract the data with total freedom. In a different post I will show you how to build a dashboard to present this data and reveal insights out of it.  

_Note_: this is not an universal process that will work every time, but it may give you a head start and useful information in cases where your target website has a mobile app.

## API >> Web page
As a rule of thumb. It's great if we can extract data through a target's site API instead of having to parse HTML files for various reasons:
1. Reliability. API definitions tend to vary way less often than rendered web pages over time
2. Robustness. HTML scraping depend on parsing rules that are fragile because they depend on "soft definition" such as CSS attributes, element IDs, elements order, URL linking strategies, metadata, SPA labels, etc.
3. Accesibility. Hosted sites are protected way more heavily than APIs. The latter might have throttling, but it surely won't have WAF, perimetrals, CAPTCHA or honeypots
4. Speed. APIs don't need rendering, static files nor additional blocking server calls

> Remember: in scraping API >> HTML (always look first for possible APIs that serve the data you need)

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


## Analyzing interesting requests


## GraphQL introspection


## Building a Scrapy spider


## Summary