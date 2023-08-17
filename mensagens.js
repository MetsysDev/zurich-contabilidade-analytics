class Mensagen {
    static error(msg=null) {
        msg = msg || 'erro desconhecido!';

        iziToast.error({
            message: msg,
            position: 'topCenter'
        });
    }

}