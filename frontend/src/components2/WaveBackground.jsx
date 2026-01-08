import React from 'react'

export default function WaveBackground() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-blue-500">
            <svg
                className="absolute bottom-0 w-full h-64"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
            >
                <path
                    fill="#ffffff"
                    fillOpacity="1"
                    d="M0,96L30,85.3C60,75,120,53,180,85.3C240,117,300,203,360,213.3C420,224,480,160,540,122.7C600,85,660,75,720,96C780,117,840,171,900,186.7C960,203,1020,181,1080,181.3C1140,181,1200,203,1260,186.7C1320,171,1380,117,1410,90.7L1440,64L1440,320L1410,320C1380,320,1320,320,1260,320C1200,320,1140,320,1080,320C1020,320,960,320,900,320C840,320,780,320,720,320C660,320,600,320,540,320C480,320,420,320,360,320C300,320,240,320,180,320C120,320,60,320,30,320L0,320Z"
                ></path>
            </svg>
            <div className="absolute inset-0 flex justify-center items-center">
                <h1 className="text-white text-6xl font-bold">Welcome</h1>
            </div>
        </div>
    )
}
