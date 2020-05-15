const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addStudent = async (_, { data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access === `student`) throw new Forbidden(`Access Denied !!!`);
	res = await connection.db(`RBMI`).collection(`students`).findOne({
		username: data.username,
	});
	if (res)
		throw new Error(`Already exists...`, {
			error: `${res.username} is already assigned to someone. Please choose another username !`,
		});
	res = await connection
		.db(`RBMI`)
		.collection(`students`)
		.insertOne({
			...data,
			createdAt: Date.now(),
			createdBy: user.username,
		});
	return res.insertedCount > 0
		? `${data.username} added successfully`
		: `There was some error saving data, please try again or contact admin if issue persists`;
};
