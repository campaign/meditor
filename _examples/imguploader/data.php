<?php
/**
 * Created by JetBrains PhpStorm.
 * User: zhoumeimei
 * Date: 13-3-8
 * Time: 上午11:11
 * To change this template use File | Settings | File Templates.
 */

$headers = apache_request_headers();
$fn = (isset($headers['X_FILENAME']) ? $headers['X_FILENAME'] : rand(0, 100000).'.png');
if ($fn) {
    file_put_contents(
        'uploads/' . $fn,
        file_get_contents('php://input')
    );
    echo "./uploads/$fn";
    exit();
}