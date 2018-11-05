var express = require("express");
var app = express();
var aws = require("aws-sdk");

aws.config.loadFromPath("./config.json");

