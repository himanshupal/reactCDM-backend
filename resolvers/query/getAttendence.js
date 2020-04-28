const { client } = require(`../../index`);

exports.getAttendence = async (_, args) => {
	if (!args._id || !args.class) {
		throw new Error(
			`You must provide a date & class as _id & class to get attendence details !!!`
		);
	}
	try {
		const res = await (await client)
			.db(`RBMI`)
			.collection(`attendence`)
			.aggregate([
				{
					$match: {
						_id: args._id,
						class: args.class,
					},
				},
				{
					$lookup: {
						from: `students`,
						localField: `students`,
						foreignField: `_id`,
						as: `students`,
					},
				},
			])
			.toArray();
		return res[0];
	} catch (error) {
		throw new Error(error);
	}
};
