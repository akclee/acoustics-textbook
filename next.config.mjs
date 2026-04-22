import createMDX from '@next/mdx'

const withMDX = createMDX({
  // MDX options here (remark/rehype plugins can go here later)
})

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

export default withMDX(nextConfig)