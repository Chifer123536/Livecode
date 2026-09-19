import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Строгий режим React: в dev компоненты монтируются дважды,
	// чтобы сразу вылезали эффекты без cleanup.
	reactStrictMode: true,
}

export default nextConfig
