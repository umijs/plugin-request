export default {
  '/api/users': {
    success: true,
    result: ['pigcan', 'sorrycc'],
  },
  '/api/users/failure': (req, res) => {
    res.end(
      JSON.stringify({
        success: false,
        errorMessage: `Request failed with showType ${req.query.showType}`,
        showType: +req.query.showType,
      }),
    );
  },
  '/api/status/failure': (req, res) => {
    res.status(302);
    res.send();
  },
};
