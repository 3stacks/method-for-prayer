'use client'

import { useEffect, useRef, useState } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import clsx from 'clsx'

const sections = [
  { id: 'parts', title: 'The six parts' },
  { id: 'features', title: 'Features' },
  { id: 'download', title: 'Get the app' },
  { id: 'book', title: 'The book' },
  { id: 'apps', title: 'Other apps' },
]

function MenuIcon({
  open,
  ...props
}: React.ComponentPropsWithoutRef<'svg'> & {
  open: boolean
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d={open ? 'M17 7 7 17M7 7l10 10' : 'm15 16-3 3-3-3M15 8l-3-3-3 3'}
      />
    </svg>
  )
}

export function NavBar() {
  let navBarRef = useRef<React.ElementRef<'div'>>(null)
  let [activeIndex, setActiveIndex] = useState<number | null>(null)
  let mobileActiveIndex = activeIndex === null ? 0 : activeIndex

  useEffect(() => {
    function updateActiveIndex() {
      if (!navBarRef.current) {
        return
      }

      let newActiveIndex = null
      let elements = sections
        .map(({ id }) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)
      let bodyRect = document.body.getBoundingClientRect()
      let offset = bodyRect.top + navBarRef.current.offsetHeight + 1

      if (window.scrollY >= Math.floor(bodyRect.height) - window.innerHeight) {
        setActiveIndex(sections.length - 1)
        return
      }

      for (let index = 0; index < elements.length; index++) {
        if (
          window.scrollY >=
          elements[index].getBoundingClientRect().top - offset
        ) {
          newActiveIndex = index
        } else {
          break
        }
      }

      setActiveIndex(newActiveIndex)
    }

    updateActiveIndex()

    window.addEventListener('resize', updateActiveIndex)
    window.addEventListener('scroll', updateActiveIndex, { passive: true })

    return () => {
      window.removeEventListener('resize', updateActiveIndex)
      window.removeEventListener('scroll', updateActiveIndex)
    }
  }, [])

  return (
    <div ref={navBarRef} className="sticky top-0 z-50">
      <Popover className="sm:hidden">
        {({ open }) => (
          <>
            <div
              className={clsx(
                'relative flex items-center px-4 py-3',
                !open &&
                  'bg-paper/95 shadow-sm dark:bg-night/95 [@supports(backdrop-filter:blur(0))]:bg-paper/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur-sm dark:[@supports(backdrop-filter:blur(0))]:bg-night/80',
              )}
            >
              {!open && (
                <>
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm text-gold-600 dark:text-gold-300"
                  >
                    {(mobileActiveIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="ml-4 font-ui text-base font-medium text-slate-900 dark:text-slate-100">
                    {sections[mobileActiveIndex].title}
                  </span>
                </>
              )}
              <PopoverButton
                className={clsx(
                  '-mr-1 ml-auto flex h-8 w-8 items-center justify-center',
                  open && 'relative z-10',
                )}
                aria-label="Toggle navigation menu"
              >
                {!open && (
                  <>
                    {/* Increase hit area */}
                    <span className="absolute inset-0" />
                  </>
                )}
                <MenuIcon open={open} className="h-6 w-6 stroke-slate-700 dark:stroke-slate-300" />
              </PopoverButton>
            </div>
            <PopoverPanel className="absolute inset-x-0 top-0 bg-paper/95 py-3.5 shadow-sm dark:bg-night/95 [@supports(backdrop-filter:blur(0))]:bg-paper/80 [@supports(backdrop-filter:blur(0))]:backdrop-blur-sm dark:[@supports(backdrop-filter:blur(0))]:bg-night/80">
              {sections.map((section, sectionIndex) => (
                <PopoverButton
                  as="a"
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center px-4 py-1.5"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-sm text-gold-600 dark:text-gold-300"
                  >
                    {(sectionIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="ml-4 font-ui text-base font-medium text-slate-900 dark:text-slate-100">
                    {section.title}
                  </span>
                </PopoverButton>
              ))}
            </PopoverPanel>
            <div className="absolute inset-x-0 bottom-full z-10 h-4 bg-paper dark:bg-night" />
          </>
        )}
      </Popover>
      <div className="hidden sm:flex sm:h-32 sm:justify-center sm:border-b sm:border-slate-200 sm:bg-paper/95 sm:[@supports(backdrop-filter:blur(0))]:bg-paper/80 sm:[@supports(backdrop-filter:blur(0))]:backdrop-blur-sm dark:sm:border-slate-800 dark:sm:bg-night/95 dark:sm:[@supports(backdrop-filter:blur(0))]:bg-night/80">
        <ol
          role="list"
          className="mb-[-2px] grid auto-cols-[minmax(0,15rem)] grid-flow-col font-ui text-base font-medium text-slate-900 [counter-reset:section] dark:text-slate-100"
        >
          {sections.map((section, sectionIndex) => (
            <li key={section.id} className="flex [counter-increment:section]">
              <a
                href={`#${section.id}`}
                className={clsx(
                  'flex w-full flex-col items-center justify-center border-b-2 before:mb-2 before:font-mono before:text-sm before:content-[counter(section,decimal-leading-zero)]',
                  sectionIndex === activeIndex
                    ? 'border-brand-600 bg-brand-50 text-brand-600 before:text-gold-600 dark:border-brand-300 dark:bg-night-2 dark:text-brand-300 dark:before:text-gold-300'
                    : 'border-transparent before:text-slate-500 hover:bg-brand-50/40 hover:before:text-slate-900 dark:hover:bg-night-2/60 dark:hover:before:text-slate-100',
                )}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
