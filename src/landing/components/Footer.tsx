import cx from 'classnames';
import logoUrl from '../assets/brand/aligntraits-logo.svg';
import { FOOTER } from '../data/landing-content.ts';
import { ROUTES } from '../data/routes.ts';
import { focusLight, pageColumn } from '../lib/styles.ts';
import { SmartLink } from './ui/SmartLink.tsx';
import { SocialIcon } from './ui/SocialIcon.tsx';

export function Footer() {
  return (
    <footer className="border-t-2 border-at-line bg-at-mist">
      <div className={cx(pageColumn, 'pb-12 pt-12 xl:pb-[57px] xl:pt-16')}>
        <div className="grid gap-10 sm:grid-cols-3 lg:grid-cols-[494.7fr_208.4fr_208.4fr_208.4fr] lg:gap-x-8">
          <div className="sm:col-span-3 lg:col-span-1">
            <SmartLink
              href={ROUTES.home}
              aria-label="AlignTraits home"
              className={cx('-my-2 flex w-fit rounded-md py-2', focusLight)}
            >
              <img
                src={logoUrl}
                alt="AlignTraits"
                width={2459}
                height={322}
                className="h-auto w-[200px] sm:h-8 sm:w-[239.5px]"
              />
            </SmartLink>
            <p className="mt-5 max-w-sm text-[15px] leading-6 text-at-slate xl:mt-[19px]">{FOOTER.tagline}</p>
          </div>

          {FOOTER.columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-[14px] font-semibold leading-5 text-at-ink">{column.heading}</h2>
              <ul className="mt-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <SmartLink
                      href={link.href}
                      className={cx(
                        'block rounded-sm py-3 text-[14px] leading-5 text-at-slate xl:py-2 transition-colors hover:text-at-ink motion-reduce:transition-none',
                        focusLight,
                      )}
                    >
                      {link.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t-2 border-at-line">
        <div className={cx(pageColumn, 'flex flex-col gap-4 pb-6 pt-6 xl:flex-row xl:items-center')}>
          <ul className="flex gap-7 xl:gap-3">
            {FOOTER.social.filter((item) => item.href !== '#').map((item) => (
              <li key={item.platform}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className={cx(
                    '-m-3.5 flex h-11 w-11 items-center justify-center rounded-md text-at-slate xl:-m-1.5 xl:h-7 xl:w-7 transition-colors hover:text-at-ink motion-reduce:transition-none',
                    focusLight,
                  )}
                >
                  <SocialIcon platform={item.platform} />
                </a>
              </li>
            ))}
          </ul>
          <p className="text-[14px] leading-5 text-at-slate xl:ml-auto xl:mr-[157.9px]">{FOOTER.bottomLine}</p>
        </div>
      </div>
    </footer>
  );
}
