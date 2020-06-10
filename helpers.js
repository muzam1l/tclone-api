/**
 * @returns input if good
 * @throws {Error} with info message'}
 * @param {String} input - input to sanitize
 * @param type - one of name, username, password, custom
 * @param {Object} opts optional setings with sig { min_length, max_length, regex }
 */
function escapeHtml(unsafe) {
    if (!unsafe || unsafe.length === 0)
        return unsafe
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function filterInput(input, type = 'custom', {
    min_length: min = 1,
    max_length: max = 70,
    regex: reg = null
} = {}) {
    let regexes = {
        username: RegExp(`^[_a-zA-Z0-9]{${min},${max}}$`),
        password: RegExp(`^\\S{${min},${max}}$`),
        name: RegExp(`.{${min},${max}}`),
    }
    if (!reg) {
        reg = regexes[type]
    }
    if (reg) {
        if (!reg.test(input)) {
            throw Error(`${type} must match ${reg}`)
        }
    }
    //else custom
    else if (input.length > max || input.length < min) {
        throw Error(`inputs must be minimum ${min} and maximum ${max} characters`)
    }
    return escapeHtml(input);
}
function getRandomProfileUrl() {
    //geneartes random pic in img
    let imgs = [
        'animals-1298747.svg',
        'bunny-155674.svg',
        'cat-154642.svg',
        'giraffe-2521453.svg',
        'iron-man-3829039.svg',
        'ironman-4454663.svg',
        'lion-2521451.svg',
        'man-1351317.svg',
        'pumpkin-1640465.svg',
        'rat-152162.svg',
        'sherlock-3828991.svg',
        'spider-man-4639214.svg',
        'spiderman-5247581.svg',
        'thor-3831290.svg',
        'tiger-308768.svg',
        'whale-36828.svg'
    ]
    let img = imgs[Math.floor(Math.random() * imgs.length)];
    return `https://tclone-api.herokuapp.com/img/${img}`
}

exports.filterInput = filterInput;
exports.getRandomProfileUrl = getRandomProfileUrl;