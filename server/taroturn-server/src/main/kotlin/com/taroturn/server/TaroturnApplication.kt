package com.taroturn.server

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class TaroturnApplication

fun main(args: Array<String>) {
    runApplication<TaroturnApplication>(*args)
}
