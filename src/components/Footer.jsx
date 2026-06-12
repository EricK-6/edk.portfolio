export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-grey-400/50 dark:border-grey-800">
      <div className="container-page py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-grey-500 dark:text-grey-500">
          © {year} Dohyun (Eric) Kim · Built with React & Tailwind
        </p>
        <div className="flex items-center gap-4 text-sm">
          <a
            href="https://github.com/EricK-6"
            target="_blank"
            rel="noreferrer"
            className="text-grey-500 hover:text-grey-900 dark:text-grey-500 dark:hover:text-grey-200"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/erick06/"
            target="_blank"
            rel="noreferrer"
            className="text-grey-500 hover:text-grey-900 dark:text-grey-500 dark:hover:text-grey-200"
          >
            LinkedIn
          </a>
          <a
            href="mailto:dohyunkim290106@gmail.com"
            className="text-grey-500 hover:text-grey-900 dark:text-grey-500 dark:hover:text-grey-200"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
