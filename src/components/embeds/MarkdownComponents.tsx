import type { Components } from 'react-markdown'
import type { ReactNode, ReactElement } from 'react'
import { TweetEmbed } from './TweetEmbed'
import { SubstackEmbed } from './SubstackEmbed'

const TWITTER_PATTERN = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/
const SUBSTACK_PATTERN = /^https?:\/\/[^.]+\.substack\.com\/p\//

function isTwitterUrl(url: string): boolean {
  return TWITTER_PATTERN.test(url)
}

function isSubstackUrl(url: string): boolean {
  return SUBSTACK_PATTERN.test(url)
}

function extractLinkInfo(element: ReactElement): { href: string; text: string } | null {
  if (element.type !== 'a' || !element.props) {
    return null
  }

  const props = element.props as { href?: string; children?: ReactNode }
  const href = props.href

  if (typeof href !== 'string') {
    return null
  }

  const children = props.children
  let text = ''

  if (typeof children === 'string') {
    text = children
  } else if (Array.isArray(children)) {
    text = children
      .filter((child): child is string => typeof child === 'string')
      .join('')
  }

  return { href, text }
}

function getStandaloneLinkInfo(
  children: ReactNode
): { href: string; text: string } | null {
  const childArray = Array.isArray(children) ? children : [children]
  const meaningfulChildren = childArray.filter((child) => {
    if (typeof child === 'string') {
      return child.trim().length > 0
    }
    return true
  })

  if (meaningfulChildren.length !== 1) {
    return null
  }

  const onlyChild = meaningfulChildren[0]
  if (
    typeof onlyChild === 'object' &&
    onlyChild !== null &&
    'type' in onlyChild &&
    'props' in onlyChild
  ) {
    return extractLinkInfo(onlyChild as ReactElement)
  }

  return null
}

function CustomParagraph({
  children,
}: {
  children?: ReactNode
}): React.JSX.Element {
  const linkInfo = getStandaloneLinkInfo(children)

  if (linkInfo) {
    const { href, text } = linkInfo
    if (isTwitterUrl(href)) {
      return <TweetEmbed url={href} linkText={text} />
    }
    if (isSubstackUrl(href)) {
      return <SubstackEmbed url={href} linkText={text} />
    }
  }

  return <p>{children}</p>
}

export const markdownComponents: Components = {
  p: CustomParagraph,
}
