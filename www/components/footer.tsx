import Image from "next/image";
import Link from "next/link";
import { DEVB_BUY_ME_A_COFFEE_LINK, DEVB_GITHUB_LINK } from "@/lib/constants";

const Footer = () => {
  return (
    <div className="bg-[#1E1E1E] text-white py-16 rounded-t-[24px]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-around gap-12">
          {/* Logo and Description */}
          <div className="max-w-sm">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/images/logo-white.png"
                  alt="devb.io"
                  width={120}
                  height={54}
                />
              </div>
            </div>
            <p className="text-[#F3F3F3] text-sm opacity-60 mt-2">
              Effortless Portfolios for Developers
            </p>
            <p className="text-[#F3F3F3] text-sm opacity-60 mt-1">
              contact@devb.io
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={DEVB_GITHUB_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  Star us on Github
                </Link>
              </li>
              <li>
                <Link
                  href={DEVB_BUY_ME_A_COFFEE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  Support us
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-medium mb-4">Follow us</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://x.com/devb_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  X
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/devb-io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com/devb_io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="https://linkedin.com/company/devb-io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F3F3F3] opacity-60 hover:opacity-100 text-sm"
                >
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/*/!* Copyright *!/*/}
        {/*<div className="mt-16 pt-8 border-t border-white/10">*/}
        {/*  <p className="text-[#F3F3F3] opacity-60 text-center">*/}
        {/*    &copy; {new Date().getFullYear()} devb.io. All rights reserved.*/}
        {/*  </p>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default Footer;
