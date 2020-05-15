const { client, Error, ObjectId, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.updateTeacher = async (_, { id, data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access !== (`Head of Department` || `Director`))
		throw new Forbidden(`Access Denied !!!`);
	res = await connection
		.db(`RBMI`)
		.collection(`teachers`)
		.updateOne(
			{
				_id: ObjectId(id),
			},
			{
				$set: {
					...data,
					lastUpdated: Date.now(),
					lastUpdatedBy: user.username,
				},
			}
		);
	return res.modifiedCount > 0
		? `Record updated !`
		: `No teacher found matching given _id...`;
};
