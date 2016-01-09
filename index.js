var counter = 0;

function startTask(config, classNames){
	var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;

	var login = config;

	var driver = new webdriver.Builder()
	    .forBrowser(login.driver)
	    .build();
	driver.manage().window().setSize(1920,1080)
	driver.get('https://instagram.com/explore/tags/sydneyfoodies/');
	driver.wait(until.elementLocated(By.className('_onabe')), 15000);
	driver.findElement(By.css('._6ssv5[href="/accounts/login/"]')).click().then(function(){
		driver.wait(until.elementLocated(By.name('username')), 15000);
		driver.findElement(By.name('username')).sendKeys(login.user);
		driver.findElement(By.name('password')).sendKeys(login.pass);
		driver.findElement(By.tagName('button')).click();
		driver.wait(until.elementLocated(By.css('nav[role="navigation"]')), 15000).then(function(){
			openTag(getTag());
		});
	});
	

	function openTag(tag){
		driver.get('https://instagram.com/explore/tags/' + tag + '/');
		driver.wait(until.elementLocated(By.css('nav[role="navigation"]')), 15000).then(function(){
			driver.findElements(By.className(classNames.photoPreview)).then(function(elements_arr){ 
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
		});
	}

	function openModalAndClick(element, cb){
		element.click();
	   	driver.wait(until.elementLocated(By.className(classNames.heart)), 10000).then(function(){
	   		driver.findElement(By.className(classNames.heart)).click().then(function(){
			   		setTimeout(function(){
			   			driver.findElement(By.className(classNames.closeModal)).click().then(function(){
					   		counter++;
					   		console.log(counter + ':liked something on ' + login.driver);
					   		setTimeout(cb, randomTime());
					   	});
			   		}, Math.random() * randomTime())
			   	});
	   	}, function(){
	   		console.log('does not exist');
			cb();
	   	});
//   	if (Math.random() > 0.5) driver.findElement(By.className('-cx-PRIVATE-FollowButton__buttonEnabled')).click();
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

	
}

try{
	var configs = require('./config');

	configs.users.forEach(function(config){
		startTask(config, configs.classNames)
	});
} catch (err) {
	console.log('--error happened--');
	console.log(err);
	console.log('restarting');
	setTimeout(startTask, 5000);
}
