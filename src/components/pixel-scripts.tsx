"use client";

import Script from "next/script";

interface PixelScriptsProps {
  facebookPixelId?: string | null;
  tiktokPixelId?: string | null;
}

/**
 * Injects the Facebook Pixel and TikTok Pixel base codes.
 * IDs are managed from the admin panel (Settings tab).
 */
export default function PixelScripts({ facebookPixelId, tiktokPixelId }: PixelScriptsProps) {
  return (
    <>
      {facebookPixelId ? (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
                t=b.getElementsByTagName(e)[0];t.parentNode.insertBefore(t,s)
              }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      ) : null}
      {tiktokPixelId ? (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,t){
                w.TiktokAnalyticsObject=t;
                var ttq=w[t]=w[t]||[];
                ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','set','unset','setAndTrack','trackAndSet'];
                ttq.factory=function(e){return function(){var a=Array.prototype.slice.call(arguments);a.unshift(e);ttq.push(a);return ttq}};
                for(var i=0;i<ttq.methods.length;i++){ttq[ttq.methods[i]]=ttq.factory(ttq.methods[i])}
                var s=d.createElement('script');
                s.type='text/javascript';s.async=true;
                s.src='https://analytics.tiktok.com/i18n/pixel/events/v3/sdk.js';
                var f=d.getElementsByTagName('script')[0];
                f.parentNode.insertBefore(s,f);
              })(window,document,'ttq');
              ttq.load('${tiktokPixelId}');
              ttq.page();
            `,
          }}
        />
      ) : null}
    </>
  );
}
