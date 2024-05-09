const toggleClass = (element, class_ = "hidden") => {
    element.classList.contains(class_) ? element.classList.remove(class_) : element.classList.add(class_)
}
const randNum = (end, start = 0) => { return Math.random() * (end - start) + start }

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
    render() {this.el.innerHTML = this.value},
    save() {
        localStorage.setItem(this.name, this.value)
        this.render()
    },
    load() {
        this.value = localStorage.getItem(this.name) || 0;
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
    get el() {return document.getElementById(this.name)},
    anim: null,
    animGen: {
        frames: [
            { scale: 5 },
            { scale: 2, backgroundColor: "darkred", },
            { scale: 8, backgroundColor: "orange", },
            { scale: 4, backgroundColor: "darkorange", },
            { scale: 150, backgroundColor: "red", opacity:1},
            {opacity:0.98},
            {opacity:0.95,scale:75},
            { scale:0,display: "none", opacity: "0.3", },
        ],
        timing: {duration: 9 * 1000,easing: "ease",fill: "both",},
        get target() { return explosive.el },
        animate() {explosive.anim = this.target.animate(this.frames, this.timing)},
    },

}

const cont = {
    el: document.getElementById("cont"),
    randPad() {
        let [xb, yb] = [5, 5]
        let [xc, yc] = [44, 88]
        let [xs, ys] = [xc - xb, yc - yb]
        this.el.style.paddingLeft = randNum(xs) + "vh"
        this.el.style.paddingTop = randNum(ys) + "vh"
    }
}

const box = {
    el: document.querySelector(".box"),
    anim: null,
    durationDefault: 2000,
    animGen:
    {
        frames: [{ backgroundColor: "red" }],
        timing: {duration: 2000,},
        get target() { return box.el },
        animate() {box.anim = this.target.animate(this.frames, this.timing)},
    },
    move() {cont.randPad()},
    updateTime() {
        let timeLimit = this.anim.effect.getComputedTiming().duration
        let updateMap = [[1500, 50], [1200, 25], [1000, 20], [800, 5], [0, 2],]
        for (const [time, reduction] of updateMap) {
            if (timeLimit > time) {
                const newLimit = timeLimit - reduction
                return this.anim.effect.updateTiming({ duration: newLimit })
            }
        }

    },
    resetTime() {
        this.anim.effect.updateTiming({ duration: this.durationDefault })
    },
    listeners: [{
        type: "click", fn: (e) => {
            box.anim.cancel()
            box.move()
            box.anim.play()
        }
    },
    ],

    addListeners() { for (const lstnr of this.listeners) { this.el.addEventListener(lstnr.type, lstnr.fn) } },
    init() {
        this.animGen.animate()
        this.anim.cancel()
        this.addListeners()
    }


}
const endPage = {
    name: "endPage",
    get el() { return document.getElementById(this.name) },
    btn: {
        name: "endBtn",
        get el() { return document.getElementById(this.name) },
        listeners: [{ type: "click", fn: (e) => game.again() }],
        addListeners() { for (const lstnr of this.listeners) { this.el.addEventListener(lstnr.type, lstnr.fn) } },
        init() { this.addListeners() }
    },
    init() { this.btn.init() }
}
const game = {
    hideList: [endPage.el, explosive.el]    ,
    hideAtBegin() { this.hideList.forEach(item => toggleClass(item)) }    ,
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
        toggleClass(explosive.el)
        toggleClass(box.el)
        explosive.animGen.animate()
        const tino = setTimeout(() => toggleClass(endPage.el), explosive.animGen.timing.duration - 6 * 1000)

    },
    again() {
        level.reset()
        toggleClass(endPage.el)
        toggleClass(box.el)
        box.resetTime()

    },

}

game.init()
