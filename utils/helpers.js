/**
 * @returns input if good
 * @throws {Error} with info message'}
 * @param {String} input - input to sanitize
 * @param type - one of name, username, password, custom
 * @param {Object} opts optional setings with sig { min_length, max_length, regex }
 */
function escapeHtml(unsafe) {
    if (!unsafe || unsafe.length === 0) return unsafe
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}
/**
 * filterInput - direct copy from fron-end with Dompurify removed
 * @returns input if good
 * @throws {Error} with user-friendly message'}
 * @param {String} input - input to sanitize
 * @param type - one of 'name', 'username', 'password', 'html', 'custom'
 * @param {Object} opts optional setings with sig { min_length, max_length, regex }
 */
function filterInput(
    input = '',
    type = 'custom',
    { min_length: min = 1, max_length: max = 70, regex: reg = null, identifier = null } = {}
) {
    identifier = identifier || `input {${type}}`
    input = input.toString().trim()
    let regexes = {
        username: RegExp(`^[_a-zA-Z0-9]{${min},${max}}$`),
        password: RegExp(`^\\S{${min},${max}}$`),
        name: RegExp(`^.{${min},${max}}$`),
    }
    if (!reg) {
        reg = regexes[type]
    }
    if (reg) {
        if (!reg.test(input)) {
            throw Error(
                `${identifier} must match regex: ${reg} (range between ${min} and ${max} characters)`
            )
        }
    }
    //else custom || html
    // if (type === 'html')
    //     input = DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b'] }).trim()
    if (input.length > max || input.length < min) {
        throw Error(`${identifier} must be minimum ${min} and maximum ${max} characters`)
    }
    if (input.includes('\n'))
        // long text, strip of multiple newlines etc
        input = input.replace(/\n+/g, '\n').trim()
    return input
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
        'whale-36828.svg',
    ]
    let img = imgs[Math.floor(Math.random() * imgs.length)]
    return `https://tclone-api.herokuapp.com/img/${img}`
}

// Hot-fix, better mechanism later on
function ensureCorrectImage(url) {
    if (!url || !url.startsWith('https://tclone-api.herokuapp.com/img/')) {
        return getRandomProfileUrl()
    }
    return url
}

exports.filterInput = filterInput
exports.ensureCorrectImage = ensureCorrectImage
exports.getRandomProfileUrl = getRandomProfileUrl
