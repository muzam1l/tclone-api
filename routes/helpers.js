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
        username: RegExp(`^[a-zA-Z0-9]{${min},${max}}$`),
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
exports.filterInput = filterInput;