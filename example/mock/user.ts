
export default {
  '/api/users': {
    success: true,
    data: [
      'pigcan',
      'sorrycc',
    ],
  },
  '/api/users/failure': (req, res) => {
    res.end(JSON.stringify({
      success: false,
      errorMessage: `Request failed with showType ${req.query.showType}`,
      showType: req.query.showType,
    }));
  },
}
