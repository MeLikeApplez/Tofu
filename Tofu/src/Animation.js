export default class Animation {
    constructor() {
        this.animator = null
        this.animatorCallback = null

        this.allowTryCatchErrorsPause = true

        this.fps = null
        this.delta = null
        this.isAnimating = false
        this.isDocumentVisible = true
        this.documentVisibleCount = 0

        document.addEventListener("visibilitychange", () => {
            if(document.visibilityState !== 'visible') this.isDocumentVisible = false
        })
    }

    runner(callbackAnimation) {
        let lastCalledTime
        let frameCount = 0
        let fps, delta

        // https://stackoverflow.com/questions/19764018/controlling-fps-with-requestanimationframe - controlling fps
        const callback = () => {
            this.animator = window.requestAnimationFrame(callback)

            if(!this.isDocumentVisible) {
                this.fps = 0
                this.delta = 0
                this.documentVisibleCount++

                if(document.visibilityState === 'visible') {
                    if(this.documentVisibleCount >= 5) {
                        this.isDocumentVisible = true
                        this.documentVisibleCount = 0
                        lastCalledTime = 0
                    }
                }
                
                return
            }

            frameCount++

            if(frameCount < 4) return false
            if(!lastCalledTime) return lastCalledTime = performance.now()

            delta = (performance.now() - lastCalledTime) / 1000
            lastCalledTime = performance.now()
            fps = 1 / delta

            this.isAnimating = true
            this.fps = fps
            this.delta = delta

            if(typeof callbackAnimation === 'function') {
                try {
                    callbackAnimation(fps, delta)
                } catch(err) {
                    if(this.allowTryCatchErrorsPause) {
                        console.warn('[ERROR CAUGHT WHILE ANIMATING]\n Set "allowTryCatchErrorsPause" to "false" mitigate pauses')
                        console.error(err)
    
                        this.pause()
                    }
                }
            }
        }

        this.animatorCallback = callback
        callback()

        const { run, pause } = this

        return { run, pause }
    }

    run() {
        this.isAnimating = true
        this.animatorCallback()
    }

    pause() {
        this.isAnimating = false
        window.cancelAnimationFrame(this.animator)
    }
}