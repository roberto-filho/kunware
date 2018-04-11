module.exports = notFound;

function notFound( req, res, next ) {
    let err = new Error( 'Not found. Pika pika?' );
    err.status = 404;
    next( err );
}
