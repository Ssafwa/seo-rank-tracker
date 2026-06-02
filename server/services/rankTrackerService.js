import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY,
});

//search Google for a keyword nd extrect ranking result for a terget domain.
export async function rankTracker(keyword, targetDomain){
    let browser;
    try {
        // 1.initialize browserbase session & connect playwright
        const session = await bb.sessions.create({browserSettings: {blockAds: true}});
        browser = await chromium.connectOverCDP(session.connectUrl)
        const page = browser.contexts()[0].pages()[0];
        page.setDefaultNavigationTimeout(45000);


       // 2. initial google visit & consent handling
       await page.goto("https://www.google.com", {waitUntil: "networkidle"});
       try {
        const btn = await page.$('button[id=L2AGLB], form[action*="] button')
        if(btn){
            await btn.click();
            await page.waitForTimeout(1500);
        }
    }   catch { }
    let found = null,
       allResults = [];

          const cleanTarget = targetDomain.replace("www.", "").toLowerCase();

          // 3. search Logo: iterate throught up to 5 pages of google results 
          // ✅ FIXED ONLY THIS LOOP INNER BLOCK: Corrected backticks, encodeURIComponent, and variable casing
          for(let gpage = 0; gpage < 5; gpage++){
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${gpage * 10}&num=10&hl=en&gl=us`, {waitUntil: "networkidle"});
          
        // 4. page extrection: retry up to 3 times if result are missing 
          // ✅ FIXED TYPO: Changed variable name from pagResult to pageResult to match usage below
          let pageResult = [];
          for (let retry = 0; retry < 3; retry++){
            try {
                await page.waitForSelector('h3', { timeout: 8000});
                await page.waitForTimeout(1500)
                pageResult = await page.evaluate(()=> Array.from(document.querySelectorAll
                    ("h3")).map((h3)=>{
                        let a = h3.closest('a');
                        if(!a){
                            let p = h3.parentElement;
                            for(let j = 0; j < 5 && p; j++, p = p.parentElement){
                                if(p.tagName === "A"){
                                    a = p;
                                    break;
                                }
                                    const sub = p.querySelector("a[href]");
                                    if(sub && sub.contains(h3)){
                                        a = sub;
                                        break;
                                    }
                                }
                            }
                            if(!a || !a.href.startsWith("http") || a.href.includes('google.')) return
                            null;
                            let s = "",
                            c = a.parentElement;
                            // ✅ FIXED: Restructured condition syntax loop scope to fix infinite runtime tab crashes
                            for(let j = 0; j < 6; j++, c = c.parentElement){
                                const txt = c.innerText || "";
                                if(txt.length > h3.innerText.length + 50){
                                    // ✅ FIXED TYPOS: Changed invalid identifier '1' to variable 'l', and '/n' to '\n'
                                    s = (txt.split("\n").find((l)=>l.length > 30 && !l.includes(h3.
                                        innerText.substring(0,20))) || "").trim().substring(0,300);
                                        if(s) break;
                                }
                            } 
                            return {url: a.href, domain: new URL(a.href).hostname.replace("www.", ""),
                             title: h3.innerText.trim(), snippet: s}


                        

                    }).filter(Boolean)
                );
                if(pageResult.length > 0) break;
                await page.reload({waitUntil: "networkidle"});
            } catch (error) {
                if(retry === 2)  break;
                await page.reload({waitUntil: "networkidle"})
                
            }
          }
          if(!pageResult.length) break;

          //5. result synthesis: update globaly result and check for target match 
          for (const r of pageResult){
            r.position = allResults.length + 1;
            allResults.push(r)
            if(!found && (r.domain.toLowerCase().includes(cleanTarget) || cleanTarget.includes
        (r.domain.toLowerCase()))){
            found = {...r, page: gpage + 1}
        }
          }
           if(found) break;
           await page.waitForTimeout(2000 + Math.random() * 2000);
        
        } 

        // 6.finilization: close browser and extract comptitors
        await browser.close();
        const competitor = allResults.filter((r)=>!r.domain.toLowerCase().includes
        (cleanTarget) && !cleanTarget.includes(r.domain.toLowerCase())).slice(0,10);

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position || null,
                page: found?.page || null,
                title: found?.title || "",
                snippet: found?.snippet || "",
                competitor,
                totalResultScanned: allResults.length            }
        }


       } catch (error) {
           console.error("Rank check error", error.message);
           if(browser) await browser.close().catch(()=>{})
             return {success: false, error: error.message}
       }

    }