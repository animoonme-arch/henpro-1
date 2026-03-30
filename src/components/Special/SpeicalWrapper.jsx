import React from 'react'
import Special from './Special'
import { SessionProvider } from 'next-auth/react'

const SpeicalWrapper = ({ video, id }) => {
    return (
        <div>
            <SessionProvider>
                <Special video={video} id={id} />
            </SessionProvider>
        </div>
    )
}

export default SpeicalWrapper
