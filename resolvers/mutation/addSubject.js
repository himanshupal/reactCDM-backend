const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addSubject = async (_, { data }, { headers }) => {
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
		.collection(`subjects`)
		.findOne({ subjectCode: data.subjectCode });
	if (res)
		throw new Error(`Already exists...`, {
			error: `Subject ${res.name} with code ${res.subjectCode} already exists !`,
		});
	res = await connection
		.db(`RBMI`)
		.collection(`subjects`)
		.insertOne({
			...data,
			createdAt: Date.now(),
			createdBy: user.username,
		});
	return res.insertedCount > 0
		? `Subject ${data.subjectCode} saved successfully`
		: `There was some error saving data, please try again or contact admin if issue persists`;
};
