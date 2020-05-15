const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.createGist = async (_, { data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student` && data.scope === `public`)
		throw new Forbidden(`Access Denied !!!`);
	res = await connection
		.db(`RBMI`)
		.collection(`gists`)
		.insertOne({
			...data,
			createdAt: Date.now(),
			createdBy: user.username,
		});
	return res.insertedCount > 0
		? `Saved successfully`
		: `There was some error saving data, please try again or contact admin ! `;
};
