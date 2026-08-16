//vars
const typeColors = {
    normal:"gray",
    fighting:"orange",
    flying:"cyan",
    poison:"purple",
    ground:"taupe",
    rock:"slate",
    bug:"lime",
    ghost:"fuchsia",
    steel:"mist",
    fire:"red",
    water:"blue",
    grass:"green",
    electric:"yellow",
    psychic:"indigo",
    ice:"teal",
    dragon:"amber",
    dark:"neutral",
    fairy:"pink",
}

let savedCards = []
let activeColor = "gray"
let currentCard = {}

// funcs
// creating cards
const generate = async () => {
    if ($('#pmInput').val() != '') {
        // request api
        const pm = await getPokemon()
        if (pm != null) {
            // if succcess
            toggleLoading()

            const card = await newCard(pm)

            updateCard(card)

            toggleLoading()
        } else {
            // if req fails
            console.error('API Error Occured')
            $('#genBtn').text('INVALID POKÉMON')
            setTimeout(() => {
                $('#genBtn').text('GENERATE CARD')
            }, 1000)
            return
        }
        $('#saveBtn').addClass('flex!')
    }
    return
}

const getPokemon = async () => {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${$('#pmInput').val()}`)
        if (!res.ok) { return null }

        const data = await res.json()
        return data
    } catch (error) {
        return null
    }
}

const newCard = async pokemon => {
    return {
        'name':pokemon.name,
        'hp':pokemon.stats[0].base_stat,
        'moves':[await getRandomMove(pokemon), await getRandomMove(pokemon)],
        'typeImg':await getTypeImg(pokemon),
        'sprite':pokemon.sprites.front_default,
        'color':typeColors[pokemon.types[0].type.name],
        'height':`${pokemon.height / 10} M`,
        'weight':`${pokemon.weight / 10} KG`,
        'xp':pokemon.base_experience,
        'num':pokemon.id
    }
}

const updateCard = (card) => {
    $('#cardName').text(card.name)
    $('#cardHP').text('HP ' + card.hp)
    $('#moveContainer').html('')
    card.moves.forEach(move => {
        if (!card.moves.every(m => m.name == move.name) || $('#moveContainer').children().length === 0)
        {
            $('#moveContainer').append(createMove(move))
        }
    })
    $('#cardType').attr('src', card.typeImg)
    $('#cardImg').attr('src', card.sprite)
    $('link[rel*="icon"]').attr('href', card.sprite);
    $('#card').removeClass(`bg-${activeColor}-500`).addClass(`bg-${card.color}-500`)
    $('#cardWeight').text(card.weight)
    $('#cardHeight').text(card.height)
    $('#cardXP').text(card.xp)
    $('#cardNum').text('#' + card.num)
    
    activeColor = card.color
    currentCard = card
    return
}

const createMove = (move) => {
    return `<div class="move w-8/10">
        <div class="flex justify-between">
            <h4 class="font-bold text-xl">${move.name}</h4>
            <h4 class="font-bold text-xl">${move.pp}</h4>
        </div>
        <p class="text-med">${move.flavor_text_entries.findLast(i => i.language.name === 'en').flavor_text}</p>
    </div>`
}

const getRandomMove = async pokemon => {
    const allMoves = pokemon.moves
    const url = allMoves[Math.floor(Math.random() * (allMoves.length - 1))].move.url
    return await fetch(url).then(res => res.json())
}

const getTypeImg = async pokemon => {
    const data = await fetch(pokemon.types[0].type.url).then(res => res.json())
    return data.sprites['generation-viii']['sword-shield']['symbol_icon']
}

const toggleLoading = () => {
    $('#loading').toggleClass('flex hidden')
    return
}

// saving cards
const saveCard = card => {
    savedCards.push(card)

    updateSaved()
    return
}

const updateSaved = () => {
    $('#savedWrapper').html('')
    savedCards.forEach(card => {
        $('#savedWrapper').append(newSavedThumb(card.sprite, card.color))
        if ($('#filter').val() != 'none' && card.color != typeColors[$('#filter').val()]) {
            $('#savedWrapper').children().last().addClass('hidden!')
        }
    })
    return
}

const newSavedThumb = (sprite, color) => {
    return `<div class="savedCard bg-${color}-500 hover:bg-${color}-600">
                <img src="${sprite}">
            </div>`
}

$('#savedWrapper').on('click', '.savedCard', function () {
    let el = this
    
    if ($(this).children().length == 1) {
        $(this).append(`<button class="btn" onclick="openCard(${$(this).index()})">OPEN</button><button class="btn" onclick="delCard(${$(this).index()})">DELETE</button>`)
    } else {
        el = null
    }
    $('#savedWrapper').children().each(function () {
        if (this != el) {
            $(this).children('button').remove()
        }
    })
})

const openCard = idx => {
    updateCard(savedCards[idx])
    $($('#savedWrapper').children()[idx]).children('button').remove()
    return
}

const delCard = idx => {
    savedCards.splice(idx, 1)
    $('#savedWrapper').children()[idx].remove()
    return
}

// filter
$('#filter').on('change', updateSaved)

// Open/close
$(() => {
    savedCards = JSON.parse(localStorage.getItem('savedCards'))
    updateSaved()
})
window.addEventListener("beforeunload", (e) => {
    localStorage.setItem('savedCards', JSON.stringify(savedCards))
})