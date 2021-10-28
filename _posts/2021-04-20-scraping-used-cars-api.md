---
title: 'Private APIs, mobile apps and You in the Middle'
toc: true
categories:
  - scraping
tags:
  - scraping
  - graphql
  - python
  - ecommerce
---

While global interest for web scraping **has doubled** in the last 4 years, it's still not easy to find tutorials that dive deep into advanced and important topics spinning around scraping. I still struggle to find relevant posts about scraping efficiently as scale: from system design to scaling automated browsers, session handling and storing or recent evasion techniques.

!["Web scraping" Google Trends](/assets/images/post-scraping-graphql/webscraping_google_trends_2021.png)

Can you estimate how many _scraping tutorials_ are in Medium? Google says there are around **65K**. A similar search with the "advanced" term yields a tenth of that. If you spend some time skimming through them, you'll quickly find out that either they lack depth or they just don't reveal anything new and it's almost a copy paste of a different one.

```bash
curl "https://www.google.com/search?q=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29&client=firefox-b-d&oq=site%3Amedium.com+scraping+%28tutorial+OR+intro+OR+introduction+OR+easy%29" -A "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0" | grep -Eo 'Aproximadamente (.*?) resultados'
>>> Aproximadamente 66.400 resultados
```

**_What does this tell us?_** Well, there's a bit of secrecy in the obscure world of scraping once you want to confront certain challenges. Probably, those that find out the tricks are gaining a competitive advantage that are reluctant to share. Or maybe it's just there are very few experts and the chance of them wanting to spend their time blogging about it for free are low. Even if it's just for this time, I'm going to reveal some useful techniques along the way, so, <mark>keep reading!</mark>. Just note that to make the best out of this read, you should have some basic background on web scraping and computer science. 
 
**_What can you expect from this post?_** In short, I want to show you a way to scrape clean and already structured data from a website without having to deal with unstructured HTMLs. The process will teach you how to reverse engineer the API service endpoints from a large website by intercepting its backend ⟷ frontend communications using the mobile app version of the service. Then, I will show you <mark>how to introspect the GraphQL API without having access to it's official docs</mark>. I will leave to a different post how to run analytics and create a dashboard out of the data we obtained after this post.

> _Note_ 📝: this is not an universal process that will work every time, but it may give you yet-another-technique and a head start in cases where your target website has a mobile app.

## API >> Web page
As a rule of thumb. It's great if we can extract data through a target's site API instead of having to parse HTML files for various reasons:
1. Reliability. API definitions tend to vary way less often than rendered web pages over time
2. Robustness. HTML scraping depend on parsing rules that are fragile because they depend on "soft definition" such as CSS attributes, element IDs, elements order, URL linking strategies, metadata, SPA labels, etc.
3. Accessibility. Hosted sites are protected way more heavily than APIs. The latter might have throttling, but it surely won't have WAF, perimetrals, CAPTCHA or honeypots
4. Speed. APIs don't need rendering, static files nor additional blocking server calls like AJAX. It's a 1:1 communication with the data source

> ✏️ Tip: when scraping, APIs are first-class citizens. They rule over HTML web page. Always spend some time looking for APIs. Normally you would first try using a desktop browser: browsing the pages of interest while the console developer is open and on the "network" tab with the "XHR" filter activated.

For this tutorial, I'm going to be scraping [AutoScout24](https://www.autoscout24.com/), which is the largest used car marketplace in Europe, with 2MM+ active listings announced at the moment of writing this post. Due to the aforementioned reasons, we want to scrape the site using some API if possible. Please, make sure you always [respect](https://towardsdatascience.com/ethics-in-web-scraping-b96b18136f01) the target servers.


![AS24 home](/assets/images/post-scraping-graphql/as24-web-home.png "AS24 home")
{: .full}

We can first try finding interesting endpoints with the XHR technique. We go to the console developer while launching a search with filters, then click on network, then XHR, then results and we can click on the different requests from the list. We see that none of them displays results in json format, which is what we would expect from a REST API:

![AS24 XHR on desktop search](/assets/images/post-scraping-graphql/as24-xhr-no-results.png "AS24 XHR on desktop search")
{: .full}

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
![iOS mitm proxy profile install]( "iOS mitm proxy profile install")

<figure class="third">
	<img src="/assets/images/post-scraping-graphql/ios-profile-before-installed.png">
	<img src="/assets/images/post-scraping-graphql/ios-profile-during-installation.png">
  <img src="/assets/images/post-scraping-graphql/ios-profile-after-installed.png">
  <small>iOS MITM proxy profile installation</small>  
</figure>




1. Enable the SSL certificate. On iOS: `settings > general > about > certificate trust settings > toggle mitmproxy to ON`
<figure class="third">
	<img src="">
	<img src="/assets/images/post-scraping-graphql/ios-trust-certificate.png">
  <img src="">
  <small style="text-align:center;width:100%;">iOS https certificate activation</small>  
</figure>
1. Run `mitmproxy` on your computer's shell
1. Open the AutoScout24 app on your mobile device. You should now start seeing the traffic flow 😍
![MITM proxy capturing all mobile's web traffic](/assets/images/post-scraping-graphql/as24-mitm-results.png "MITM proxy capturing all mobile's web traffic")
{: .full}

_Note_ 📝: hit `?` while on mitm proxy cli to get the shortcut help list. Or visit [this](https://www.stut-it.net/blog/2017/mitmproxy-cheatsheet.html) webpage.

## Finding the API
__Placeholder for Snooping around Talk about graphql, the ios-user and tokens, results, documentation, toy swagger, Postman, app captures, searches, etc__




I'm interested in the listing endpoint. Let's focus on that endpoint from MITM's flowlist, moving with the cursors (you'll see a `>>` on the left side of the screen). Hit `enter` to switch the `flowview` view, where we can inspect the header and body of both `request` and `response`.

With the following simple code snippet one can decode a base64 encoded string:  
```python
import base64
as24_auth = "aW9zLWFwcDpBbGJ3ajJ0VlJuWEd6NTF3MmN3MWxHVnY1bzVpMDg="
as24user, as24password = base64.b64decode(as24_auth).decode('utf-8').split(":")
print(as24user, as24password)
>>> ios-app Albwj2tVRnXGz51w2cw1lGVv5o5i08
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


## Building the GraphQL queries
- Optimal amount of data (remove financing, ads, etc)
- Only listings, no images only URL
- Brand list from website

## Next steps
From here, you can build a spider using Scrapy. 

## Summary
- Invest some time looking for API data sources (heads-up upon GraphQL and REST resources). These sources are faster, more reliable, have a pre-defined schema and are less restrictive. Only scrape HTMLs after giving up on finding such data sources
- Unsecurized GraphQL deployments allow full introspection, which is similar to having access to up to date documentation of resources, models and entities of an API
- MITM Proxy is a powerful tool and useful in any mobile-involved scenario. It's worth learning the hotkeys and shortcuts because the CLI version of the tool is more powerful than the web app
- Learning backend and network concepts is a must for complex and respectful web scraping 
- You can find the source code for this project in <a href="https://github.com/the-copper-club/cold-wheels-spider">my GitHub</a>