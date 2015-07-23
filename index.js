function startTask(){
	var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

	var login = require('./config');

	var driver = new webdriver.Builder()
	    .forBrowser('firefox')
	    .build();

	driver.get('https://instagram.com/accounts/login/');
	driver.wait(until.elementLocated(By.name('username')), 15000);
	driver.findElement(By.name('username')).sendKeys(login.user);
	driver.findElement(By.name('password')).sendKeys(login.pass);
	driver.findElement(By.className('-cx-PRIVATE-LoginForm__loginButton')).click();
	driver.wait(until.elementLocated(By.className('-cx-PRIVATE-SearchBox__inactiveSearchCaption')), 15000);

	function openTag(tag){
		driver.get('https://instagram.com/explore/tags/' + tag + '/');
		driver.wait(until.elementLocated(By.className('-cx-PRIVATE-TagPage__tagName')), 15000);
		driver.findElements(By.className("-cx-PRIVATE-Photo__root")).then(function(elements_arr){ 
			var i = 10;
			function recurCall(){
				openModalAndClick(elements_arr[i], function(){
					i++;
					if (i === 15){
						openTag(getTag());
					} else {
						recurCall();
					}
				})
			}
			recurCall();
		});
	}

	function openModalAndClick(element, cb){
		element.click();
	   	driver.wait(until.elementLocated(By.className('-cx-PRIVATE-LikeButton__root')), 15000);
	   	if (Math.random() > 0.5) driver.findElement(By.className('-cx-PRIVATE-FollowButton__buttonEnabled')).click();
	   	driver.findElement(By.className('-cx-PRIVATE-LikeButton__root')).click().then(function(){
	   		setTimeout(function(){
	   			driver.findElement(By.className('-cx-PRIVATE-Modal__closeButton')).click().then(function(){
			   		setTimeout(cb, randomTime());
			   	});
	   		}, Math.random() * randomTime())
	   	});
	   	
	}

	//We have this because instagram has a limt of likes per hour and/or to mitigate the chance of being banned
	function randomTime(){
		return (Math.random() + 0.5) * 6000;
	}

	var tagNum = 0;
	function getTag(){
		if (tagNum < login.tags.length - 2){
			tagNum ++;
		} else {
			tagNum = 0;
		}
		return login.tags[tagNum];
	}

	openTag(getTag());
}

try{
	startTask();
} catch (err) {
	console.log('--error happened--');
	console.log(err);
	console.log('restarting');
	setTimeout(startTask, 5000)
}
