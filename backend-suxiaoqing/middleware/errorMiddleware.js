const errorMiddleware = (err, req, res, next) => {
    console.log(err.stack.red);
    res.status(500).json({
        message: 'Server Error'
    });
};

module.exports = errorMiddleware;