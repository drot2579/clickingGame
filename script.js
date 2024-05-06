const glb = {
    toggleClass(element, class_ = "hide") {
        element.classList.contains(class_) ? element.classList.remove(class_) : element.classList.add(class_)
    },
    randNum(end, start = 0) {
        return Math.random() * (end - start) + start
    },

}


const level = {
    name: "level",
    value: 0,
    get el() { return document.getElementById(this.name) },
    render() {
        this.el.innerHTML = this.value
    },
    increase() {
        this.value++
        this.render()
    },
    reset() {
        this.value = 0;
        this.render()
    },

}

const hscore = {
    name: "hscore",
    value: 0,
    get el() { return document.getElementById(this.name) },

    render() {
        this.el.innerHTML = this.value
    },
    save() {
        localStorage.setItem(this.name, this.value)
        this.render()
    },
    load() {
        this.value = localStorage.getItem(this.name) || 0; // num or str??
        this.render()
    },
    eval() {
        (level.value > this.value) && (this.value = level.value);
        this.save()
    },

}

// FLIP NUMBERS ANIM
const flipAnim = {
    targets: [level.el, hscore.el],
    init() {
        flipAnim.targets.forEach(target => {
            target.addEventListener("click", e => {
                let hasClass = e.target.classList.contains("flip")
                hasClass ? e.target.classList.remove("flip") : e.target.classList.add("flip")
            })
        })
    }
}

const explosive = {
    name: "explosive",
    value: undefined,
    get el() {
        return document.getElementById(this.name)
    },
    anim: null,
    animGen: {
        frames: [
            { transform: "scale(5)", },
            { backgroundColor: "darkred", transform: "scale(2)" },
            { backgroundColor: "orange", transform: "scale(8)" },
            { backgroundColor: "darkorange", transform: "scale(4)" },
            { backgroundColor: "red", transform: "scale(150)", opacity: "1" },
            { backgroundColor: "red", transform: "scale(150)", opacity: "0.98" },
            { backgroundColor: "red", transform: "scale(150)", opacity: "0.95" },
            { backgroundColor: "red", transform: "scale(150)", display: "none", opacity: "0" },
        ],
        timing: {
            duration: 11 * 1000,
            easing: "ease",
            fill: "both",
        },
        frames2: [
            { transform: "scale(5)", display: "block", },
            { backgroundColor: "darkred", transform: "scale(2)", },
            { backgroundColor: "orange", transform: "scale(8)", },
            { backgroundColor: "red", transform: "scale(4)", },
            { backgroundColor: "darkred", transform: "scale(150)", },
            { backgroundColor: "darkred", transform: "scale(150)", },
            { backgroundColor: "red", transform: "scale(0.01)", display: "none" },
        ],
        timing2: {
            duration: 6 * 1000,
            easing: "ease",
            fill: "both",
        },
        get target() { return explosive.el },
        animate() {
            explosive.anim = this.target.animate(this.frames2, this.timing2)
        },

    },

}

const cont = {
    el: document.getElementById("cont"),

    randPad() {
        let [xb, yb] = [5, 5]
        let [xc, yc] = [44, 88]
        let [xs, ys] = [xc - xb, yc - yb]
        this.el.style.paddingLeft = glb.randNum(xs) + "vh"
        this.el.style.paddingTop = glb.randNum(ys) + "vh"
    }
}

const box = {
    el: document.querySelector(".box"),
    value: undefined,
    anim: null,
    duration0: 2000,

    animGen:
    {
        frames: [
            { backgroundColor: "red" }
        ],
        timing: {
            duration: 2000,
        },
        get target() { return box.el },
        animate() {
            box.anim = this.target.animate(this.frames, this.timing)
        },

    },
    move() {

        cont.randPad()
    },
    updateTime() {
        let dur = this.anim.effect.getComputedTiming().duration
        let durStart = this.anim.effect.getComputedTiming().duration;
        if (dur > 1500) {
            this.anim.effect.updateTiming({ duration: dur - 50 })
        } else if (dur > 1200) {
            this.anim.effect.updateTiming({ duration: dur - 25 })
        } else if (dur > 1000) {
            this.anim.effect.updateTiming({ duration: dur - 20 })
        } else if (dur > 800) {
            this.anim.effect.updateTiming({ duration: dur - 5 })
        } else {
            this.anim.effect.updateTiming({ duration: dur - 2 })

        }
        let durEnd = this.anim.effect.getComputedTiming().duration;
        console.log(durStart, durEnd);
    },
    resetTime() {
        this.anim.effect.updateTiming({ duration: this.duration0 })
    },
    listeners: [
        {
            type: "click", fn: (e) => {
                box.anim.cancel()
                box.move()
                box.anim.play()

            }
        },
    ]
    ,
    addListeners() {
        for (const listener of this.listeners) {
            this.el.addEventListener(listener.type, listener.fn)
        }

    },
    init() {
        this.animGen.animate()
        // this.updateTime()
        this.anim.cancel()
        this.addListeners()
    }


}
const endPage = {
    name: "endPage",
    value: null,
    get el() { return document.getElementById(this.name) },

    btn: {
        name: "endBtn",
        value: null,
        get el() { return document.getElementById(this.name) },
        listeners: [
            { type: "click", fn: (e) => { game.again() } }
        ],
        addListeners() {
            for (const listener of this.listeners) {
                this.el.addEventListener(listener.type, listener.fn)
            }


        },
        init() { this.addListeners() }
    },
    init() {
        this.btn.init()
    }
}

const game = {
    hideList: [endPage.el, explosive.el]
    ,
    hideAtBegin() {
        this.hideList.forEach(item => {
            glb.toggleClass(item)
        })
    }
    ,
    init() {
        hscore.load()
        box.init()
        flipAnim.init()
        endPage.init()
        box.anim.oncancel = () => { this.go() }
        box.anim.onfinish = () => { this.over() }
        this.hideAtBegin()
    },
    go() {
        level.increase()
        box.updateTime()
        box.move()
    },
    over() {
        hscore.eval()


        glb.toggleClass(explosive.el)
        glb.toggleClass(box.el)
        explosive.animGen.animate()
        const tino = setTimeout(() => glb.toggleClass(endPage.el), explosive.animGen.timing.duration - 7000)

    },
    again() {
        level.reset()
        glb.toggleClass(endPage.el)
        glb.toggleClass(box.el)
        box.resetTime()


    },


}


game.init()








