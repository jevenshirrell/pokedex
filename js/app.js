const createMove = (name, dmg, desc) => {
    `<div class="move w-8/10">
        <div class="flex justify-between">
            <h4 class="font-bold text-xl">${name}</h4>
            <h4 class="font-bold text-xl">${dmg}</h4>
        </div>
        <p class="text-med">${desc}</p>
    </div>`
}