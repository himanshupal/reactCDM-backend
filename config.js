exports.jwtConfig = {
	algorithm: `HS512`,
	expiresIn: `6d`,
};

exports.hashConfig = {
	memoryCost: 128,
	hashLength: 64,
	saltLength: 32,
	parallelism: 4,
	timeCost: 8,
	type: 2,
};
