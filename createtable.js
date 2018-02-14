var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 100,
    host            : 'localhost',
    user            : 'root',
    password        : 'qkqh7083',
    database        : 'cyclist'
  });


 




        

var sql = `-- 게시글
CREATE TABLE article (
	num       INTEGER      NOT NULL, -- 글번호
	title     VARCHAR(255) NOT NULL, -- 제목
	location  VARCHAR(10)  NOT NULL, -- 지역
	content   TEXT         NOT NULL, -- 내용
	id        VARCHAR(20)  NOT NULL, -- 작성자아이디
	date      DATE         NOT NULL, -- 작성시간
	latitude  VARCHAR(20)  NULL,     -- 위도
	longitude VARCHAR(20)  NULL      -- 경도
);

-- 게시글 기본키
CREATE UNIQUE INDEX PK_article
	ON article ( -- 게시글
		num ASC -- 글번호
	);

-- 게시글
ALTER TABLE article
	ADD
		CONSTRAINT PK_article -- 게시글 기본키
		PRIMARY KEY (
			num -- 글번호
		);

-- 참가자
CREATE TABLE participant (
	num  INTEGER     NOT NULL, -- 글번호
	id   VARCHAR(20) NOT NULL, -- 아이디
	data DATE        NOT NULL  -- 신청시간
);

-- 임시 테이블
CREATE TABLE Temporary (
);

-- 회원
CREATE TABLE user (
	id       VARCHAR(20) NOT NULL, -- 아이디
	password VARCHAR(20) NOT NULL, -- 비밀번호
	name     VARCHAR(50) NOT NULL, -- 이름
	regdate  DATE        NOT NULL  -- 가입날짜
);

-- 회원 기본키
CREATE UNIQUE INDEX PK_user
	ON user ( -- 회원
		id ASC -- 아이디
	);

-- 회원
ALTER TABLE user
	ADD
		CONSTRAINT PK_user -- 회원 기본키
		PRIMARY KEY (
			id -- 아이디
		);

-- 게시글
ALTER TABLE article
	ADD
		CONSTRAINT FK_user_TO_article -- 회원 -> 게시글
		FOREIGN KEY (
			id -- 작성자아이디
		)
		REFERENCES user ( -- 회원
			id -- 아이디
		);

-- 참가자
ALTER TABLE participant
	ADD
		CONSTRAINT FK_article_TO_participant -- 게시글 -> 참가자
		FOREIGN KEY (
			num -- 글번호
		)
		REFERENCES article ( -- 게시글
			num -- 글번호
		);

-- 참가자
ALTER TABLE participant
	ADD
		CONSTRAINT FK_user_TO_participant -- 회원 -> 참가자
		FOREIGN KEY (
			id -- 아이디
		)
		REFERENCES user ( -- 회원
			id -- 아이디
        );
`




var arr = []
pool.getConnection((err, conn)=>{
    if(err) { console.log(err); return next(); }
    conn.query(sql, arr, (err, result)=>{
    conn.release();
    });
});