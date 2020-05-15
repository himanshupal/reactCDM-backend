const { client, Error, Forbidden } = require(`../../index`),
	{ CheckAuth } = require(`../../checkAuth`);

exports.addClass = async (_, { data }, { headers }) => {
	try {
		connection = await client;
	} catch {
		throw new Error(`Server error !!!`, {
			error: `There is a problem connecting to database. Contact Admin !`,
		});
	}
	user = CheckAuth(headers.authorization);
	if (user.access !== (`Head of Department` || `Director`))
		throw new Forbidden(`Access Denied !!!`);
	res = await connection.db(`RBMI`).collection(`classes`).findOne({
		class: data.class,
		year: data.year,
		batch: data.batch,
		semester: data.semester,
	});
	if (res)
		throw new Error(`Already exists...`, {
			error: `${data.class}, Year ${data.year} Sem ${data.semester} already exists for ${data.batch} !`,
		});
	res = await connection
		.db(`RBMI`)
		.collection(`classes`)
		.insertOne({
			...data,
			alias: `${data.class}, Year ${data.year} Sem ${data.semester}`,
			createdAt: Date.now(),
			createdBy: user.username,
		});
	return `${data.class}, Sem ${data.semester} added to classes`;
};
