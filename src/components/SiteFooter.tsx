import { BOOKING_URL } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-on-navy.png" alt="Agentic AI Institute" width={72} height={32} />
        <p>Claude Certification Practice Quiz · Independent, not affiliated with Anthropic</p>
        <div className="site-footer__links">
          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book a 1-on-1 Call</a>
        </div>
      </div>
    </footer>
  );
}
