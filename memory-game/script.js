document.addEventListener('DOMContentLoaded', () => {
    
    const animals = {
        'easy': ['owl', 'dragon', 'panda', 'cat', 'hedgehog', 'fox'],
        'hard': ['owl', 'dragon', 'panda', 'cat', 'hedgehog', 'fox', 'chicken', 'snake', 'bird', 'fish'],
        'very hard': ['owl', 'dragon', 'panda', 'cat', 'hedgehog', 'fox', 'chicken', 'snake', 'bird', 'fish', 'chipmunk', 'rooster', 'monkey', 'lion', 'horse']
    }


    const cards = document.querySelector('.cards'),
          stepSpan = document.querySelector('.steps'),
          scoreSpan = document.querySelector('.score'),
        //   cardItems = document.querySelectorAll('.card'),
          btn = document.querySelector('.btn'),
          nameInput = document.querySelector('.tools__input'),
          statusTool = document.querySelector('.status'),
          last = document.querySelector('.last__wrapper'),
          best = document.querySelector('.best__wrapper'),
          nickname = document.querySelector('.player'),
          tools = document.querySelector('.tools');

    let firstCard = '',
        secondCard = '',
        steps = 0,
        handledCards = 0,
        score = 0,
        lock = false,
        player = '',
        status = 'start'
        lastGames = [],
        bestGames = [
            {name: '-', score: 0, steps: 0},
            {name: '-', score: 0, steps: 0},
            {name: '-', score: 0, steps: 0}
        ];

    
    changeStatus('start')
    getLocalStorage()
    renderGames()
    renderName()
    animals['easy'].forEach(animal => {
        createCards(animal)
        createCards(animal)
    })

    btn.addEventListener('click', () => {
        if (btn.classList.contains('btn_disabled')) return
        lock = true
        resetCards()
        shuffleCards()

        btn.classList.add('btn_disabled')
        tools.style.opacity = 0
        
        console.log('player: ', player)
        changeStatus('game')
        setTimeout(() => {
            tools.style.zIndex = -1
            lock = false
        }, 300)
        
    })

    nameInput.addEventListener('input', (ev) => {
        console.log(ev.target.value)
        player = ev.target.value
        renderName()
    })

    
    cards.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('card__item') && !ev.target.parentNode.classList.contains('card_upend')) cardUpend(ev.target.parentNode);
    })

    function cardUpend(card) {

        if (lock || status !== 'game') return

        const front = card.querySelector('.card__front'),
              back = card.querySelector('.card__back');

        card.classList.add('card_upend');
        back.style.opacity = 0
        front.style.display = 'block';
        front.style.opacity = 1
        setTimeout(() => {
            back.style.display = 'none'
        }, 300)

        if (!firstCard) {
            firstCard = card
        } else {
            secondCard = card
            lock = true
        }

        if (firstCard && secondCard) {
            steps++
            stepSpan.innerHTML = steps
            checkCards()
        }
    }

    function checkCards() {
        if (firstCard.dataset.animal === secondCard.dataset.animal) {
            handledCards += 2
            score += 2
            scoreSpan.innerHTML = score
            firstCard = ''
            secondCard = ''
            
            lock = false
        } else {
            setTimeout(() => {
                removeCard(firstCard)
                removeCard(secondCard)
                score = score - 1 <= 0 ? 0 : score -1
                scoreSpan.innerHTML = score
                firstCard = ''
                secondCard = ''
                lock = false
            }, 400)
            console.log('removes: ', firstCard, secondCard)
        }
        
        if (handledCards === animals['easy'].length * 2) {
            changeStatus('over')
            btn.classList.remove('btn_disabled')

            tools.style.zIndex = 6

            setTimeout(() => {
                tools.style.opacity = 1
            }, 300)

            if (lastGames.length === 10) {
                lastGames.pop()
            }
    
            lastGames.unshift({name: player || 'Unknown', score: score, steps: steps})

            if (bestGames[2].score < score) {
                bestGames.pop()
                bestGames.push({name: player || 'Unknown', score: score, steps: steps})
                bestGames = bestGames.sort((a, b) => b.score - a.score)
            }
    
            renderGames()

            setLocalStorage('lastGames', lastGames)
            setLocalStorage('bestGames', bestGames)
        }

       
    }

    function removeCard(card) {
        card.classList.remove('card_upend');
        card.querySelector('.card__back').style.opacity = 1
        card.querySelector('.card__back').style.display = 'block'
        card.querySelector('.card__front').style.opacity = 0
        setTimeout(() => {
            card.querySelector('.card__front').style.display = 'none'
        }, 300)
    }

    function shuffleCards() {
        Array.from(cards.children).forEach(item => {
            item.style.order = Math.round(Math.random() * 12)
        }) 
    }

    function changeStatus(newStatus) {
        status = newStatus;
        switch (newStatus) {
            case 'start':
                statusTool.innerHTML = 'Press NEW GAME to start'
                break
            case 'game':
                statusTool.innerHTML = `${player || 'Unknown'} is playing now`
                nameInput.setAttribute('disabled', 'disabled')
                nameInput.classList.toggle('tools__input_disabled')
                break
            case 'over':
                statusTool.innerHTML = `Your SCORE: ${score}! <br> Press NEW GAME to start again!`
                nameInput.removeAttribute('disabled')
                nameInput.classList.toggle('tools__input_disabled')
                break
        }
    }

    function resetCards() {
        lock = true

        Array.from(cards.children).forEach(item => {
            removeCard(item)
        })

        firstCard = '',
        secondCard = '',
        steps = 0,
        handledCards = 0,
        score = 0;
        stepSpan.innerHTML = steps
        scoreSpan.innerHTML = score
    }

    function renderGames() {
        last.innerHTML = ''
        if (!lastGames.length) {
            last.innerHTML = 'No last games'
        } else {
            lastGames.forEach((item) => {
                last.append(createItem(item))
            })
        }

        best.innerHTML = ''
        bestGames.forEach((item) => {
            best.append(createItem(item))
        })
    }

    function createItem(obj) {
        const divMain = document.createElement('div')
        const divName = document.createElement('div')
        const divScore = document.createElement('div')
        const divSteps = document.createElement('div')

        divName.innerHTML = obj.name
        divScore.innerHTML = obj.score
        divSteps.innerHTML = obj.steps

        divMain.classList.add('history__item')
        divName.classList.add('item_player')
        divScore.classList.add('item_score')
        divSteps.classList.add('item_steps')

        divMain.append(divName)
        divMain.append(divScore)
        divMain.append(divSteps)

        return divMain

    }

    function setLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    function getLocalStorage() {
        if (localStorage.getItem('lastGames')) lastGames = JSON.parse(localStorage.getItem('lastGames'))
        if (localStorage.getItem('bestGames')) bestGames = (JSON.parse(localStorage.getItem('bestGames'))).sort((a, b) => b.score - a.score)

    }

    function renderName() {
        nickname.innerHTML = player || 'Unknown'
    }

    function createCards(animal) {
        const animalCard = `<div class="card" data-animal="${animal}" style="order: ${Math.round(Math.random() * 12)};">
        <img src="./assets/svg/cards/${animal}.svg" alt="${animal}" class="card__item card__front" style="display: none;">
        <img src="./assets/svg/cards/back.svg" alt="back-side" class="card__item card__back">
    </div>`
        cards.insertAdjacentHTML('beforeend', animalCard)
    }


})





