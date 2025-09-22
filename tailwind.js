tailwind.config = {
    theme: {
        extend: {
            animation: {
                'scroll-x': 'scroll-x 20s linear infinite',
                'fade-in': 'fade-in 0.5s ease-in-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'wiggle': 'wiggle 1s ease-in-out infinite',
            },
            keyframes: {
                'scroll-x': {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-100%)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'wiggle': {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' }
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        }
    }
}